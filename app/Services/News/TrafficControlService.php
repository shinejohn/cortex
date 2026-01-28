<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\DayNewsPost;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

final class TrafficControlService
{
    private const DAILY_TARGET = 20;

    // Ideal mix ratios (must sum to 1.0)
    private const CATEGORY_MIX = [
        'local_news' => 0.30,      // Hard news, crime, politics (Target: 6)
        'sports' => 0.20,          // HS sports, local leagues (Target: 4)
        'events' => 0.20,          // "Around Town", calendar (Target: 4)
        'community' => 0.15,       // Human interest, profiles (Target: 3)
        'business' => 0.10,        // New openings, chamber of commerce (Target: 2)
        'other' => 0.05,           // Weather, notices (Target: 1)
    ];

    /**
     * Determine if a draft should be published right now based on traffic rules.
     */
    public function shouldPublishNow(NewsArticleDraft $draft): bool
    {
        $region = Region::find($draft->region_id);
        if (!$region) {
            return false; // Safety check
        }

        // 1. Immediate override for High Priority / Breaking News
        if ($this->isBreakingNews($draft)) {
            Log::info("TrafficControl: Immediate publish for breaking news", ['draft_id' => $draft->id]);
            return true;
        }

        // 2. Check Daily Target (Pacing)
        // We aim for ~20/day to ensure a consistent stream.
        // If we exceed this, we "bank" the rest for tomorrow to avoid feast/famine cycles.
        $todayCount = $this->getPublishedCountToday($region);
        if ($todayCount >= self::DAILY_TARGET) {
            Log::info("TrafficControl: Daily target reached, banking article for tomorrow", ['region' => $region->name]);
            return false;
        }

        // 3. Check Category Mix "Hunger"
        // Does the system "need" this category right now to satisfy the mix?
        $category = $this->mapTopicToCategory($draft->topic_tags[0] ?? 'other');
        if ($this->isCategorySaturated($region, $category)) {
            Log::info("TrafficControl: Category saturated, holding", ['category' => $category]);
            // We might still publish if we are way behind on overall count, 
            // but strictly following "Mix" means generally holding back saturated topics.

            // Exception: If it's late in the day (after 6 PM) and we are effectively empty, 
            // just publish to fill the feed.
            if (now()->hour < 18) {
                return false;
            }
        }

        // 4. Time Slotting (Simple Logic)
        // Don't dump everything at 3 AM. Ensure spread.
        if (!$this->isGoodTimeSlot($region)) {
            Log::info("TrafficControl: Waiting for better time slot");
            return false;
        }

        return true;
    }

    /**
     * Calculate a priority score for sorting the queue.
     * Higher score = Publish first.
     */
    public function calculatePriorityScore(NewsArticleDraft $draft): int
    {
        $score = $draft->quality_score ?? 0;

        // Boost for breaking/timely content
        if ($this->isBreakingNews($draft)) {
            $score += 50;
        }

        // Boost for under-represented categories
        $category = $this->mapTopicToCategory($draft->topic_tags[0] ?? 'other');
        $region = Region::find($draft->region_id); // Inefficient query in loop, cache in prod

        if ($region && !$this->isCategorySaturated($region, $category)) {
            $score += 20;
        }

        return $score;
    }

    private function isBreakingNews(NewsArticleDraft $draft): bool
    {
        // Simple heuristic: Keyword check or explicit flag
        // In future phases, this comes from the "Importance" classifier
        $keywords = ['breaking', 'urgent', 'alert', 'emergency', 'missing', 'crisis'];
        $title = strtolower($draft->generated_title ?? '');

        foreach ($keywords as $word) {
            if (str_contains($title, $word)) {
                return true;
            }
        }

        return false;
    }

    private function getPublishedCountToday(Region $region): int
    {
        return DayNewsPost::whereHas('regions', function ($query) use ($region) {
            $query->where('region_id', $region->id);
        })
            ->whereDate('published_at', Carbon::today())
            ->count();
    }

    private function isCategorySaturated(Region $region, string $category): bool
    {
        // How many of this category published today?
        $count = DayNewsPost::whereHas('regions', function ($query) use ($region) {
            $query->where('region_id', $region->id);
        })
            ->where('category', $category)
            ->whereDate('published_at', Carbon::today())
            ->count();

        $target = self::DAILY_TARGET * (self::CATEGORY_MIX[$category] ?? 0.05);

        // Allow slight overage (e.g. +1) before cutting off
        return $count >= ($target + 1);
    }

    private function isGoodTimeSlot(Region $region): bool
    {
        // Simple "Business Hours + Evening" logic (6 AM to 10 PM)
        // In future, this could adhere to specific "Edition" windows
        $hour = now()->hour;
        return $hour >= 6 && $hour <= 22;
    }

    // Duplicate logic from PublishingService, candidate for shared helper or Enum
    public function mapTopicToCategory(string $topic): string
    {
        $mapping = [
            'local' => 'local_news',
            'business' => 'business',
            'sports' => 'sports',
            'entertainment' => 'events', // Map to events/"around town"
            'community' => 'community',
            'education' => 'community',
            'health' => 'community',
            'politics' => 'local_news',
            'crime' => 'local_news',
            'weather' => 'other',
            'events' => 'events',
            'obituary' => 'community',
            'missing_person' => 'local_news',
            'emergency' => 'local_news',
            'public_notice' => 'other',
        ];

        return $mapping[$topic] ?? 'other';
    }
}

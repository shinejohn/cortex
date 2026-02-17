<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\RawContent;
use App\Models\StoryFollowUp;
use App\Models\StoryThread;
use Illuminate\Support\Facades\Log;

final class StoryTrackingService
{
    /**
     * Create a story thread from a published article.
     */
    public function createThread(string $regionId, string $title, string $topic, array $entities, string $articleId, string $priority = 'normal'): StoryThread
    {
        $keyPeople = $entities['people'] ?? [];
        $keyOrgs = $entities['organizations'] ?? [];
        $keyBusinesses = $entities['businesses'] ?? [];

        return StoryThread::create([
            'region_id' => $regionId,
            'title' => $title,
            'category' => $topic,
            'key_people' => $keyPeople,
            'key_organizations' => array_merge($keyOrgs, $keyBusinesses),
            'priority' => $priority === 'critical' ? StoryThread::PRIORITY_CRITICAL : ($priority === 'high' ? StoryThread::PRIORITY_HIGH : StoryThread::PRIORITY_MEDIUM),
            'status' => StoryThread::STATUS_DEVELOPING,
            'is_resolved' => false,
            'last_development_at' => now(),
            'next_check_at' => now()->addHours(168),
        ]);
    }

    /**
     * Check if new content matches any active story thread.
     */
    public function checkForRelatedContent(RawContent $raw): array
    {
        $matches = [];
        $entities = array_merge(
            array_column($raw->people_mentioned ?? [], 'name'),
            array_column($raw->businesses_mentioned ?? [], 'name'),
            array_column($raw->organizations_mentioned ?? [], 'name'),
        );

        if (empty($entities) || ! $raw->region_id) {
            return $matches;
        }

        $activeThreads = StoryThread::active()
            ->where('region_id', $raw->region_id)
            ->get();

        foreach ($activeThreads as $thread) {
            $threadPeople = is_array($thread->key_people ?? null) ? $thread->key_people : [];
            $threadOrgs = is_array($thread->key_organizations ?? null) ? $thread->key_organizations : [];
            $threadEntities = array_merge(
                array_map(fn ($p) => is_array($p) ? ($p['name'] ?? $p) : $p, $threadPeople),
                array_map(fn ($o) => is_array($o) ? ($o['name'] ?? $o) : $o, $threadOrgs),
            );

            $overlap = array_intersect(
                array_map('strtolower', array_filter($entities)),
                array_map('strtolower', array_filter($threadEntities))
            );

            if (! empty($overlap)) {
                $followUp = StoryFollowUp::create([
                    'story_thread_id' => $thread->id,
                    'type' => 'development',
                    'trigger' => 'new_content_detected',
                    'description' => 'New content mentions: '.implode(', ', $overlap),
                    'source_content_id' => $raw->id,
                    'status' => 'pending',
                ]);

                $thread->increment('total_articles');
                $thread->update(['last_development_at' => now(), 'last_article_at' => now()]);
                $matches[] = ['thread' => $thread, 'follow_up' => $followUp, 'entities' => $overlap];

                Log::info('StoryTracking: Related content detected', [
                    'thread' => $thread->title,
                    'raw_content_id' => $raw->id,
                    'matching_entities' => $overlap,
                ]);
            }
        }

        return $matches;
    }

    /**
     * Process threads due for scheduled check-in.
     */
    public function processScheduledChecks(): int
    {
        $threads = StoryThread::needsFollowUp()->get();
        $processed = 0;

        foreach ($threads as $thread) {
            StoryFollowUp::create([
                'story_thread_id' => $thread->id,
                'type' => 'update',
                'trigger' => 'auto_scheduled',
                'description' => "Scheduled check-in for: {$thread->title}",
                'status' => 'pending',
                'scheduled_for' => now(),
            ]);

            $thread->scheduleNextCheck(7);
            $processed++;
        }

        return $processed;
    }
}

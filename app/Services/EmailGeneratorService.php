<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Community;
use App\Models\EmailCampaign;
use App\Models\EmailSubscriber;
use App\Models\EmailTemplate;
use App\Models\EmailSend;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

final class EmailGeneratorService
{
    public function __construct(
        private readonly AIContentService $aiService,
        private readonly EmailDeliveryService $deliveryService
    ) {}

    /**
     * Generate daily digest for a community
     */
    public function generateDailyDigest(Community $community): EmailCampaign
    {
        // Gather content for digest
        $content = $this->gatherDigestContent($community);

        // Generate AI-written summaries
        $aiContent = $this->aiService->generateDigestContent($community, $content);

        // Get template
        $template = EmailTemplate::where('slug', 'daily-digest')
            ->where('is_active', true)
            ->first();

        // Create campaign
        $campaign = EmailCampaign::create([
            'community_id' => $community->id,
            'template_id' => $template?->id,
            'name' => "Daily Digest - {$community->name} - " . now()->format('M j, Y'),
            'type' => 'daily_digest',
            'status' => 'scheduled',
            'subject' => $aiContent['subject'] ?? "Daily Digest - {$community->name}",
            'preview_text' => $aiContent['preview'] ?? 'Your daily roundup of local news and events.',
            'html_content' => $this->renderDigestHtml($community, $content, $aiContent, $template),
            'text_content' => $this->renderDigestText($community, $content, $aiContent),
            'segment' => ['type' => 'reader', 'preferences.daily_digest' => true],
            'scheduled_at' => $this->getOptimalSendTime($community, 'daily_digest'),
        ]);

        // Queue recipients
        $this->queueRecipients($campaign);

        return $campaign;
    }

    /**
     * Generate weekly newsletter for a community
     */
    public function generateWeeklyNewsletter(Community $community): EmailCampaign
    {
        // Gather week's content
        $content = $this->gatherWeeklyContent($community);

        // Generate AI editorial
        $aiContent = $this->aiService->generateNewsletterContent($community, $content);

        $template = EmailTemplate::where('slug', 'weekly-newsletter')
            ->where('is_active', true)
            ->first();

        $campaign = EmailCampaign::create([
            'community_id' => $community->id,
            'template_id' => $template?->id,
            'name' => "Weekly Newsletter - {$community->name} - Week of " . now()->format('M j'),
            'type' => 'weekly_newsletter',
            'status' => 'scheduled',
            'subject' => $aiContent['subject'] ?? "Weekly Newsletter - {$community->name}",
            'preview_text' => $aiContent['preview'] ?? 'Your weekly roundup of local news and events.',
            'html_content' => $this->renderNewsletterHtml($community, $content, $aiContent, $template),
            'text_content' => $this->renderNewsletterText($community, $content, $aiContent),
            'segment' => ['preferences.weekly_newsletter' => true],
            'scheduled_at' => $this->getOptimalSendTime($community, 'weekly_newsletter'),
        ]);

        $this->queueRecipients($campaign);

        return $campaign;
    }

    /**
     * Generate breaking news alert
     */
    public function generateBreakingNews(Community $community, array $newsData): EmailCampaign
    {
        $campaign = EmailCampaign::create([
            'community_id' => $community->id,
            'name' => "Breaking: {$newsData['headline']}",
            'type' => 'breaking_news',
            'status' => 'sending', // Send immediately
            'subject' => "Breaking: {$newsData['headline']}",
            'preview_text' => substr($newsData['summary'] ?? '', 0, 150),
            'html_content' => $this->renderBreakingNewsHtml($community, $newsData),
            'text_content' => $this->renderBreakingNewsText($community, $newsData),
            'segment' => ['type' => 'reader', 'preferences.breaking_news' => true],
            'started_at' => now(),
        ]);

        $this->queueRecipients($campaign, true); // Priority queue

        return $campaign;
    }

    /**
     * Generate SMB performance report
     */
    public function generateSmbReport(Community $community): EmailCampaign
    {
        $template = EmailTemplate::where('slug', 'smb-weekly-report')
            ->where('is_active', true)
            ->first();

        $campaign = EmailCampaign::create([
            'community_id' => $community->id,
            'template_id' => $template?->id,
            'name' => "SMB Weekly Report - {$community->name} - " . now()->format('M j'),
            'type' => 'smb_report',
            'status' => 'scheduled',
            'subject' => "Your Weekly Performance Report - " . now()->format('M j'),
            'preview_text' => "See how your business performed this week",
            'segment' => ['type' => 'smb'],
            'scheduled_at' => now()->next('Monday')->setTime(7, 0),
        ]);

        // SMB reports are personalized per business, handled differently
        $this->queueSmbReportRecipients($campaign);

        return $campaign;
    }

    /**
     * Gather content for daily digest
     */
    protected function gatherDigestContent(Community $community): array
    {
        return [
            'top_stories' => DB::table('day_news_posts')
                ->where('community_id', $community->id)
                ->where('published_at', '>=', now()->subDay())
                ->where('status', 'published')
                ->orderByDesc('view_count')
                ->limit(5)
                ->get(),
            'upcoming_events' => DB::table('events')
                ->where('community_id', $community->id)
                ->where('start_date', '>=', now())
                ->where('start_date', '<=', now()->addDays(7))
                ->where('status', 'published')
                ->orderBy('start_date')
                ->limit(5)
                ->get(),
            'featured_businesses' => DB::table('businesses')
                ->where('community_id', $community->id)
                ->where('is_featured', true)
                ->inRandomOrder()
                ->limit(3)
                ->get(),
        ];
    }

    /**
     * Gather content for weekly newsletter
     */
    protected function gatherWeeklyContent(Community $community): array
    {
        return [
            'top_stories' => DB::table('day_news_posts')
                ->where('community_id', $community->id)
                ->where('published_at', '>=', now()->subWeek())
                ->where('status', 'published')
                ->orderByDesc('view_count')
                ->limit(10)
                ->get(),
            'events' => DB::table('events')
                ->where('community_id', $community->id)
                ->where('start_date', '>=', now())
                ->where('start_date', '<=', now()->addWeek())
                ->where('status', 'published')
                ->orderBy('start_date')
                ->limit(10)
                ->get(),
        ];
    }

    /**
     * Get optimal send time for community based on timezone and type
     */
    protected function getOptimalSendTime(Community $community, string $type): \Carbon\Carbon
    {
        $timezone = $community->timezone ?? 'America/New_York';
        $times = [
            'daily_digest' => '06:00',
            'weekly_newsletter' => '08:00',
            'smb_report' => '07:00',
        ];
        $time = $times[$type] ?? '09:00';

        return now($timezone)->setTimeFromTimeString($time)->setTimezone('UTC');
    }

    /**
     * Queue recipients for campaign
     */
    protected function queueRecipients(EmailCampaign $campaign, bool $priority = false): void
    {
        $query = EmailSubscriber::where('community_id', $campaign->community_id)
            ->where('status', 'active');

        // Apply segment filters
        if ($segment = $campaign->segment) {
            foreach ($segment as $key => $value) {
                if (str_starts_with($key, 'preferences.')) {
                    $prefKey = str_replace('preferences.', '', $key);
                    $query->whereJsonContains("preferences->{$prefKey}", $value);
                } else {
                    $query->where($key, $value);
                }
            }
        }

        $subscribers = $query->get();
        $campaign->update(['total_recipients' => $subscribers->count()]);

        foreach ($subscribers->chunk(100) as $chunk) {
            $sends = $chunk->map(fn($sub) => [
                'campaign_id' => $campaign->id,
                'subscriber_id' => $sub->id,
                'status' => 'queued',
                'created_at' => now(),
                'updated_at' => now(),
            ])->toArray();

            EmailSend::insert($sends);
        }
    }

    /**
     * Queue SMB report recipients (personalized per business)
     */
    protected function queueSmbReportRecipients(EmailCampaign $campaign): void
    {
        $subscribers = EmailSubscriber::where('community_id', $campaign->community_id)
            ->where('type', 'smb')
            ->where('status', 'active')
            ->whereNotNull('business_id')
            ->get();

        $campaign->update(['total_recipients' => $subscribers->count()]);

        foreach ($subscribers as $subscriber) {
            EmailSend::create([
                'campaign_id' => $campaign->id,
                'subscriber_id' => $subscriber->id,
                'status' => 'queued',
            ]);
        }
    }

    /**
     * Render digest HTML
     */
    protected function renderDigestHtml(Community $community, array $content, array $aiContent, ?EmailTemplate $template): string
    {
        // Get ads for email
        $ads = app(AdServerService::class)->getEmailAds($community->id, 'daily_digest', 2);

        return view('emails.digest', [
            'community' => $community,
            'content' => $content,
            'aiContent' => $aiContent,
            'ads' => $ads,
        ])->render();
    }

    /**
     * Render digest text
     */
    protected function renderDigestText(Community $community, array $content, array $aiContent): string
    {
        $text = ($aiContent['intro'] ?? '') . "\n\n";
        foreach ($content['top_stories'] ?? [] as $story) {
            $text .= ($story->title ?? 'Untitled') . "\n";
            $text .= substr($story->excerpt ?? $story->content ?? '', 0, 200) . "\n\n";
        }
        return $text;
    }

    /**
     * Render newsletter HTML
     */
    protected function renderNewsletterHtml(Community $community, array $content, array $aiContent, ?EmailTemplate $template): string
    {
        return view('emails.newsletter', [
            'community' => $community,
            'content' => $content,
            'aiContent' => $aiContent,
        ])->render();
    }

    /**
     * Render newsletter text
     */
    protected function renderNewsletterText(Community $community, array $content, array $aiContent): string
    {
        return ($aiContent['editorial'] ?? '') . "\n\n" . "Top Stories:\n" . collect($content['top_stories'] ?? [])->map(fn($s) => ($s->title ?? 'Untitled') . "\n" . substr($s->excerpt ?? '', 0, 200))->join("\n\n");
    }

    /**
     * Render breaking news HTML
     */
    protected function renderBreakingNewsHtml(Community $community, array $newsData): string
    {
        return view('emails.breaking-news', [
            'community' => $community,
            'newsData' => $newsData,
        ])->render();
    }

    /**
     * Render breaking news text
     */
    protected function renderBreakingNewsText(Community $community, array $newsData): string
    {
        return ($newsData['headline'] ?? 'Breaking News') . "\n\n" . ($newsData['summary'] ?? '') . "\n\n" . ($newsData['url'] ?? '');
    }
}


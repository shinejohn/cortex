<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\DayNewsPost;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use App\Models\WriterAgent;
use App\Services\WriterAgent\AgentAssignmentService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class PublishingService
{
    public function __construct(
        private readonly AgentAssignmentService $agentAssignmentService,
        private readonly TrafficControlService $trafficControlService
    ) {
    }

    /**
     * Publish articles (Phase 7)
     */
    public function publishArticles(Region $region): int
    {
        if (!config('news-workflow.publishing.enabled', true)) {
            Log::info('Publishing is disabled', ['region' => $region->name]);

            return 0;
        }

        $publishedCount = 0;

        Log::info('Starting publishing process', [
            'region' => $region->name,
        ]);

        // Get drafts ready for publishing
        // We get ALL ready drafts because TrafficControl will decide priority
        $drafts = NewsArticleDraft::where('region_id', $region->id)
            ->where('status', 'ready_for_publishing')
            ->with('newsArticle')
            ->get();

        Log::info('Found drafts ready for publishing', [
            'region' => $region->name,
            'count' => $drafts->count(),
        ]);

        // Sort drafts by Priority Score before processing
        $drafts = $drafts->sortByDesc(fn($draft) => $this->trafficControlService->calculatePriorityScore($draft));

        foreach ($drafts as $draft) {
            try {
                // Check Traffic Control logic
                if ($this->trafficControlService->shouldPublishNow($draft)) {
                    $post = $this->publishDraft($draft, 'published');
                    $publishedCount++;

                    Log::info('Auto-published article via Traffic Control', [
                        'draft_id' => $draft->id,
                        'post_id' => $post->id,
                        'title' => $draft->generated_title,
                        'category' => $post->category,
                    ]);
                } else {
                    // It remains in 'ready_for_publishing' for the next run
                    Log::debug('Article held by Traffic Control', [
                        'draft_id' => $draft->id,
                        'reason' => 'Quota, Mix, or Timing rules',
                    ]);
                }
            } catch (Exception $e) {
                Log::error('Failed to publish article', [
                    'draft_id' => $draft->id,
                    'error' => $e->getMessage(),
                ]);

                $draft->update([
                    'status' => 'rejected',
                    'rejection_reason' => 'Publishing failed: ' . $e->getMessage(),
                ]);
            }
        }

        Log::info('Publishing process completed', [
            'region' => $region->name,
            'published' => $publishedCount,
        ]);

        return $publishedCount;
    }

    /**
     * DEPRECATED: Legacy logic replaced by TrafficControlService
     * Kept private if needed for fallback, but main flow uses TrafficControl
     */
    private function shouldAutoPublish(NewsArticleDraft $draft): bool
    {
        return $this->trafficControlService->shouldPublishNow($draft);
    }

    /**
     * Publish draft to DayNewsPost
     */
    private function publishDraft(NewsArticleDraft $draft, string $status): DayNewsPost
    {
        return DB::transaction(function () use ($draft, $status) {
            // Prepare metadata with SEO information
            $metadata = [
                'meta_description' => $draft->seo_metadata['meta_description'] ?? null,
                'meta_keywords' => $draft->seo_metadata['keywords'] ?? [],
                'og_title' => $draft->seo_metadata['og_title'] ?? $draft->generated_title,
                'og_description' => $draft->seo_metadata['og_description'] ?? $draft->generated_excerpt,
                'image_attribution' => $draft->seo_metadata['image_attribution'] ?? null,
                'image_photographer' => $draft->seo_metadata['image_photographer'] ?? null,
                'image_alt' => $draft->seo_metadata['image_alt'] ?? null,
                'source_draft_id' => $draft->id,
            ];

            // Transfer trust metrics if available (AI-generated articles)
            if (isset($draft->ai_metadata['trust_metrics'])) {
                $metadata['trust_metrics'] = $draft->ai_metadata['trust_metrics'];
                $metadata['is_ai_generated'] = true;
            }

            // Generate unique slug (handles duplicates)
            $baseSlug = $draft->seo_metadata['slug'] ?? $this->generateSlug($draft->generated_title ?? '');
            $uniqueSlug = $this->ensureUniqueSlug($baseSlug);

            // Determine article category
            $category = $this->mapTopicTagToCategory($draft->topic_tags[0] ?? null);

            // Check if writer agent was pre-assigned during article generation (Phase 6)
            $preAssignedAgentId = $draft->ai_metadata['writer_agent_id'] ?? null;
            $agent = $preAssignedAgentId ? WriterAgent::find($preAssignedAgentId) : null;

            // Fallback to finding a suitable agent if not pre-assigned
            if (!$agent) {
                $region = Region::find($draft->region_id);
                $agent = $region ? $this->agentAssignmentService->findBestAgent($region, $category) : null;
            }

            // Create DayNewsPost
            $post = DayNewsPost::create([
                'title' => $draft->generated_title,
                'slug' => $uniqueSlug,
                'content' => $draft->generated_content,
                'excerpt' => $draft->generated_excerpt,
                'status' => $status,
                'published_at' => $status === 'published' ? now() : null,
                'featured_image' => $draft->featured_image_url,
                'featured_image_path' => $draft->featured_image_path,
                'featured_image_disk' => $draft->featured_image_disk,
                'metadata' => $metadata,
                'type' => 'article',
                'category' => $category,
                'writer_agent_id' => $agent?->id,
            ]);

            // Increment agent's article count
            if ($agent) {
                $this->agentAssignmentService->incrementArticleCount($agent);

                Log::debug('Using writer agent for article', [
                    'post_id' => $post->id,
                    'agent_id' => $agent->id,
                    'agent_name' => $agent->name,
                    'pre_assigned' => $preAssignedAgentId !== null,
                ]);
            }

            // Attach region using many-to-many relationship
            $post->regions()->attach($draft->region_id);

            // Update draft with published post ID and status
            $draft->update([
                'published_post_id' => $post->id,
                'status' => 'published',
            ]);

            return $post;
        });
    }

    /**
     * Map topic tag to valid DayNewsPost category
     */
    private function mapTopicTagToCategory(?string $topicTag): string
    {
        $mapping = [
            'local' => 'local_news',
            'business' => 'business',
            'sports' => 'sports',
            'entertainment' => 'entertainment',
            'community' => 'community',
            'education' => 'education',
            'health' => 'health',
            'politics' => 'politics',
            'crime' => 'crime',
            'weather' => 'weather',
            'events' => 'events',
            'obituary' => 'obituary',
            'missing_person' => 'missing_person',
            'emergency' => 'emergency',
            'public_notice' => 'public_notice',
        ];

        return $mapping[$topicTag] ?? 'other';
    }

    /**
     * Generate URL-friendly slug from title
     */
    private function generateSlug(string $title): string
    {
        $slug = mb_strtolower($title);
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);

        return mb_trim($slug, '-');
    }

    /**
     * Ensure slug is unique by appending counter if needed
     */
    private function ensureUniqueSlug(string $slug): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (DayNewsPost::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}

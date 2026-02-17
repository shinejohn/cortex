<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Jobs\Newsroom\PollSolicitationJob;
use App\Models\Business;
use App\Models\DayNewsPost;
use App\Models\Poll;
use App\Models\Region;
use App\Models\TopListArticle;
use App\Models\TopListTopic;
use App\Services\Cies\PollService;
use App\Services\News\GooglePlacesService;
use App\Services\News\PrismAiService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class TopListService
{
    public function __construct(
        private readonly GooglePlacesService $places,
        private readonly PrismAiService $ai,
        private readonly PollService $pollService,
        private readonly SearchTrendMiningService $searchTrends,
    ) {}

    /**
     * Run full Top List workflow: select topic, discover businesses, generate editorial, publish, create poll.
     */
    public function runForRegion(Region $region): ?TopListArticle
    {
        if (! config('news-workflow.top_list.enabled', true)) {
            return null;
        }

        $topic = $this->selectNextTopic($region);
        if (! $topic) {
            return null;
        }

        $placesType = $topic->places_type ?? $this->getPlacesTypeForTopic($topic);
        $placesData = $this->places->discoverBusinessesForCategory(
            $region,
            $placesType
        );

        $businesses = $this->resolveOrCreateBusinesses($region, $placesData, 12);
        if (count($businesses) < 4) {
            Log::warning('TopList: Insufficient businesses', [
                'region' => $region->name,
                'topic' => $topic->topic_slug,
            ]);

            return null;
        }

        $editorial = $this->generateEditorial($region, $topic, $businesses);
        $post = $this->publishEditorial($region, $editorial);
        $poll = $this->createPoll($region, $topic, $businesses);

        $article = TopListArticle::create([
            'topic_id' => $topic->id,
            'region_id' => $region->id,
            'editorial_post_id' => $post->id,
            'poll_id' => $poll->id,
            'status' => TopListArticle::STATUS_EDITORIAL_PUBLISHED,
        ]);

        $post->regions()->sync([$region->id]);
        $topic->update([
            'last_published_at' => now(),
            'next_scheduled_at' => now()->addWeeks(2),
        ]);

        return $article;
    }

    private function selectNextTopic(Region $region): ?TopListTopic
    {
        $due = TopListTopic::where('region_id', $region->id)
            ->dueForPublishing()
            ->first();

        if ($due) {
            return $due;
        }

        $targets = $this->searchTrends->getTopTargetsForRegion($region, 5);
        $topicConfigs = config('news-workflow.top_list.topics', []);
        $existingSlugs = TopListTopic::where('region_id', $region->id)
            ->pluck('topic_slug')
            ->toArray();

        foreach ($topicConfigs as $config) {
            $slug = $config['slug'];
            if (in_array($slug, $existingSlugs)) {
                continue;
            }

            $topic = TopListTopic::create([
                'region_id' => $region->id,
                'category' => $config['category'],
                'places_type' => $config['places_type'] ?? $config['category'],
                'topic_slug' => $slug,
                'display_name' => $config['display'],
                'next_scheduled_at' => now(),
            ]);

            return $topic;
        }

        return TopListTopic::where('region_id', $region->id)
            ->orderBy('last_published_at', 'asc')
            ->first();
    }

    /**
     * @param  array<int, array<string, mixed>>  $placesData
     * @return array<int, Business>
     */
    private function resolveOrCreateBusinesses(Region $region, array $placesData, int $limit): array
    {
        $businesses = [];
        foreach (array_slice($placesData, 0, $limit) as $data) {
            $business = Business::where('google_place_id', $data['google_place_id'] ?? null)->first();
            if (! $business) {
                $business = Business::create([
                    'name' => $data['name'] ?? 'Unknown',
                    'google_place_id' => $data['google_place_id'] ?? null,
                    'address' => $data['address'] ?? null,
                    'city' => $data['city'] ?? null,
                    'state' => $data['state'] ?? null,
                    'postal_code' => $data['postal_code'] ?? null,
                    'latitude' => $data['latitude'] ?? null,
                    'longitude' => $data['longitude'] ?? null,
                    'rating' => $data['rating'] ?? null,
                    'reviews_count' => $data['reviews_count'] ?? 0,
                    'phone' => $data['phone'] ?? null,
                    'website' => $data['website'] ?? null,
                    'categories' => $data['categories'] ?? [],
                    'primary_type' => $data['primary_type'] ?? null,
                    'serp_source' => 'google_places',
                ]);
            }

            $business->regions()->syncWithoutDetaching([$region->id]);
            $businesses[] = $business;
        }

        return $businesses;
    }

    private function getPlacesTypeForTopic(TopListTopic $topic): string
    {
        $configs = config('news-workflow.top_list.topics', []);
        foreach ($configs as $c) {
            if (($c['slug'] ?? '') === $topic->topic_slug) {
                return $c['places_type'] ?? $topic->category;
            }
        }

        return $topic->category;
    }

    /**
     * @param  array<int, Business>  $businesses
     */
    private function generateEditorial(Region $region, TopListTopic $topic, array $businesses): array
    {
        $names = array_map(fn ($b) => $b->name, $businesses);
        $namesStr = implode('", "', $names);
        $prompt = <<<PROMPT
Write an editorial article for {$region->name} titled "What Makes a Great {$topic->display_name} in {$region->name}?"

Featured businesses (mention 8-12): "{$namesStr}"

Requirements:
- 500-800 words
- Engaging, local-focused tone
- Mention each business naturally in context
- No rankings - this is the editorial that precedes the Community's Choice poll
- HTML format with <p>, <h2>, <strong>
- SEO-optimized

Respond with JSON: {"title": "...", "content": "...", "excerpt": "..."}
PROMPT;

        $result = $this->ai->generateJson($prompt, [
            'type' => 'object',
            'properties' => [
                'title' => ['type' => 'string'],
                'content' => ['type' => 'string'],
                'excerpt' => ['type' => 'string'],
            ],
            'required' => ['title', 'content', 'excerpt'],
        ]);

        return $result;
    }

    private function publishEditorial(Region $region, array $editorial): DayNewsPost
    {
        $slug = Str::slug($editorial['title'] ?? 'top-list').'-'.Str::random(6);
        $post = DayNewsPost::create([
            'title' => $editorial['title'] ?? 'Community\'s Choice',
            'slug' => $slug,
            'content' => $editorial['content'] ?? '',
            'excerpt' => $editorial['excerpt'] ?? '',
            'status' => 'published',
            'published_at' => now(),
            'category' => 'business',
            'type' => 'article',
            'metadata' => ['source' => 'top_list'],
        ]);
        $post->regions()->attach($region->id);

        return $post;
    }

    /**
     * @param  array<int, Business>  $businesses
     */
    private function createPoll(Region $region, TopListTopic $topic, array $businesses): Poll
    {
        $votingDays = config('news-workflow.top_list.voting_days', 7);
        $options = [];
        foreach ($businesses as $i => $business) {
            $imageUrl = null;
            if (is_array($business->images ?? null) && ! empty($business->images)) {
                $img = $business->images[0];
                $imageUrl = is_string($img) ? $img : ($img['url'] ?? $img['path'] ?? null);
            }
            $options[] = [
                'business_id' => $business->id,
                'name' => $business->name,
                'description' => $business->description,
                'image_url' => $imageUrl,
                'website_url' => $business->website,
                'display_order' => $i,
            ];
        }

        $poll = $this->pollService->createPoll([
            'region_id' => $region->id,
            'title' => "Community's Choice: Best {$topic->display_name} in {$region->name}",
            'description' => "Vote for your favorite! Poll closes in {$votingDays} days.",
            'poll_type' => 'weekly_smb_promotional',
            'category' => $topic->category,
            'topic' => $topic->topic_slug,
            'voting_starts_at' => now(),
            'voting_ends_at' => now()->addDays($votingDays),
            'is_active' => true,
            'options' => $options,
        ]);

        PollSolicitationJob::dispatch($poll);

        return $poll;
    }
}

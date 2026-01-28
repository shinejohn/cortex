<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\DayNewsPost;
use App\Models\NewsArticleDraft;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class ArticleTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'article';
    }

    public function description(): string
    {
        return 'Work with articles and drafts. Actions: published, drafts, search, by_region, recent, needing_images.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['published', 'drafts', 'search', 'by_region', 'recent', 'needing_images'],
                'description' => 'Action to perform',
                'required' => true,
            ],
            'region_id' => [
                'type' => 'string',
                'required' => false,
            ],
            'search' => [
                'type' => 'string',
                'required' => false,
            ],
            'days' => [
                'type' => 'integer',
                'description' => 'Number of days back (for recent)',
                'required' => false,
            ],
            'limit' => [
                'type' => 'integer',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'published' => $this->getPublished($params),
            'drafts' => $this->getDrafts($params),
            'search' => $this->search($params['search'] ?? '', $params['limit'] ?? 20),
            'by_region' => $this->byRegion($params['region_id'] ?? '', $params['limit'] ?? 20),
            'recent' => $this->recent($params['days'] ?? 7, $params['region_id'] ?? null),
            'needing_images' => $this->needingImages($params['limit'] ?? 20),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function getPublished(array $params): array
    {
        $query = DayNewsPost::where('status', 'published');

        if (!empty($params['region_id'])) {
            $query->where('region_id', $params['region_id']);
        }

        $articles = $query->orderByDesc('published_at')
            ->limit($params['limit'] ?? 20)
            ->get(['id', 'title', 'excerpt', 'published_at', 'region_id']);

        return ['count' => $articles->count(), 'articles' => $articles->toArray()];
    }

    protected function getDrafts(array $params): array
    {
        $query = NewsArticleDraft::where('status', 'pending');

        if (!empty($params['region_id'])) {
            $query->where('region_id', $params['region_id']);
        }

        $drafts = $query->orderByDesc('created_at')
            ->limit($params['limit'] ?? 20)
            ->get(['id', 'title', 'status', 'quality_score', 'created_at']);

        return ['count' => $drafts->count(), 'drafts' => $drafts->toArray()];
    }

    protected function search(string $term, int $limit): array
    {
        $articles = DayNewsPost::where('title', 'ILIKE', "%{$term}%")
            ->orWhere('content', 'ILIKE', "%{$term}%")
            ->limit($limit)
            ->get(['id', 'title', 'excerpt', 'published_at']);

        return ['count' => $articles->count(), 'articles' => $articles->toArray()];
    }

    protected function byRegion(string $regionId, int $limit): array
    {
        $articles = DayNewsPost::where('region_id', $regionId)
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get(['id', 'title', 'excerpt', 'published_at']);

        return ['count' => $articles->count(), 'articles' => $articles->toArray()];
    }

    protected function recent(int $days, ?string $regionId): array
    {
        $query = DayNewsPost::where('status', 'published')
            ->where('published_at', '>=', now()->subDays($days));

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $articles = $query->orderByDesc('published_at')->limit(50)->get(['id', 'title', 'published_at']);

        return [
            'period' => "Last {$days} days",
            'count' => $articles->count(),
            'articles' => $articles->toArray(),
        ];
    }

    protected function needingImages(int $limit): array
    {
        $articles = DayNewsPost::where('status', 'published')
            ->whereNull('featured_image')
            ->limit($limit)
            ->get(['id', 'title', 'published_at']);

        return [
            'count' => $articles->count(),
            'description' => 'Published articles without featured images',
            'articles' => $articles->toArray(),
        ];
    }
}

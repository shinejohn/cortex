<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Business;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class BusinessTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'business';
    }

    public function description(): string
    {
        return 'Search and analyze businesses. Actions: search, get, by_region, by_category, mentioned_in_news, without_opportunities.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['search', 'get', 'by_region', 'by_category', 'mentioned_in_news', 'without_opportunities'],
                'description' => 'Action to perform',
                'required' => true,
            ],
            'id' => [
                'type' => 'string',
                'description' => 'Business ID (for get)',
                'required' => false,
            ],
            'region_id' => [
                'type' => 'string',
                'description' => 'Filter by region',
                'required' => false,
            ],
            'category' => [
                'type' => 'string',
                'description' => 'Business category',
                'required' => false,
            ],
            'search' => [
                'type' => 'string',
                'description' => 'Search term',
                'required' => false,
            ],
            'limit' => [
                'type' => 'integer',
                'description' => 'Max results (default 20)',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'search' => $this->search($params),
            'get' => $this->get($params['id'] ?? ''),
            'by_region' => $this->byRegion($params['region_id'] ?? '', $params['limit'] ?? 20),
            'by_category' => $this->byCategory($params['category'] ?? '', $params['region_id'] ?? null, $params['limit'] ?? 20),
            'mentioned_in_news' => $this->mentionedInNews($params['region_id'] ?? null, $params['limit'] ?? 20),
            'without_opportunities' => $this->withoutOpportunities($params['region_id'] ?? null, $params['limit'] ?? 20),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function search(array $params): array
    {
        $query = Business::query();

        if (!empty($params['search'])) {
            $term = '%' . $params['search'] . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'ILIKE', $term)
                    ->orWhere('description', 'ILIKE', $term)
                    ->orWhere('address', 'ILIKE', $term);
            });
        }

        if (!empty($params['region_id'])) {
            $query->where('region_id', $params['region_id']);
        }

        if (!empty($params['category'])) {
            $query->where('category', $params['category']);
        }

        $businesses = $query->limit($params['limit'] ?? 20)->get();

        return [
            'count' => $businesses->count(),
            'businesses' => $businesses->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'category' => $b->category,
                'address' => $b->address,
                'region_id' => $b->region_id,
            ])->toArray(),
        ];
    }

    protected function get(string $id): array
    {
        $business = Business::with(['region'])->find($id);

        if (!$business) {
            return ['error' => true, 'message' => 'Business not found'];
        }

        return ['business' => $business->toArray()];
    }

    protected function byRegion(string $regionId, int $limit): array
    {
        $businesses = Business::where('region_id', $regionId)
            ->limit($limit)
            ->get(['id', 'name', 'category', 'address']);

        return ['count' => $businesses->count(), 'businesses' => $businesses->toArray()];
    }

    protected function byCategory(string $category, ?string $regionId, int $limit): array
    {
        $query = Business::where('category', $category);

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $businesses = $query->limit($limit)->get(['id', 'name', 'category', 'address', 'region_id']);

        return ['count' => $businesses->count(), 'businesses' => $businesses->toArray()];
    }

    protected function mentionedInNews(?string $regionId, int $limit): array
    {
        // Fallback or mock if articleMentions relationship doesn't exist yet
        return [
            'message' => 'Feature coming soon',
            'businesses' => [],
        ];
    }

    protected function withoutOpportunities(?string $regionId, int $limit): array
    {
        // Fallback or mock if opportunities relationship doesn't exist yet
        return [
            'message' => 'Feature coming soon',
            'businesses' => [],
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Newsroom\Ingest\Scanners;

use Illuminate\Support\Collection;
use App\Services\News\SerpApiService;
use App\Services\News\ScrapingBeeService;

class WebScanner extends BaseScanner
{
    public function __construct(
        private readonly SerpApiService $serpApi,
        private readonly ScrapingBeeService $scrapingBee
    ) {
    }

    public function getScannerType(): string
    {
        return 'web';
    }

    public function validateConfiguration(): bool
    {
        // Simple check if API keys are present (implied by service instantiation)
        return true;
    }

    public function scan(array $options = []): Collection
    {
        $query = $options['query'] ?? null;
        $region = $options['region'] ?? null;

        if (!$query || !$region) {
            $this->logError('Web scan requires query and region');
            return collect();
        }

        try {
            // Primarily use SerpApi for news searches
            $results = $this->serpApi->fetchCategoryNews($region, $query);

            $items = collect($results)->map(function ($item) use ($query) {
                return new \App\Newsroom\DTOs\Signal(
                    title: $item['title'],
                    content: $item['content_snippet'] ?? '',
                    url: $item['url'],
                    authorName: $item['source_name'] ?? 'Web Source',
                    sourceName: 'SerpApi News',
                    publishedAt: \Carbon\Carbon::parse($item['published_at'] ?? now()),
                    type: \App\Newsroom\Enums\SignalType::URL,
                    metadata: [
                        'query' => $query,
                        'source_publisher' => $item['source_publisher'] ?? null,
                    ],
                    originalId: null // URL works as identifier via content hash
                );
            });

            $this->logActivity("Scanned {$items->count()} web items for query: {$query}");
            return $items;

        } catch (\Exception $e) {
            $this->logError("Web scan failed: " . $e->getMessage());
            return collect();
        }
    }
}

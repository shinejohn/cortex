<?php

declare(strict_types=1);

namespace App\Newsroom\Ingest\Scanners;

use Illuminate\Support\Collection;
use SimplePie\SimplePie;

class RssScanner extends BaseScanner
{
    public function getScannerType(): string
    {
        return 'rss';
    }

    public function validateConfiguration(): bool
    {
        return class_exists(SimplePie::class);
    }

    public function scan(array $options = []): Collection
    {
        $feedUrl = $options['url'] ?? null;
        if (!$feedUrl) {
            $this->logError('No feed URL provided');
            return collect();
        }

        try {
            // ... (SimplePie init remains same, assuming it works)
            $feed = new SimplePie();
            $feed->set_feed_url($feedUrl);
            $feed->enable_cache(false);
            $feed->init();
            $feed->handle_content_type();

            if ($feed->error()) {
                $this->logError("Feed parsing error: " . $feed->error());
                return collect();
            }

            $items = collect();
            foreach ($feed->get_items() as $item) {
                $items->push(new \App\Newsroom\DTOs\Signal(
                    title: $item->get_title(),
                    content: $item->get_description(),
                    url: $item->get_permalink(),
                    authorName: $item->get_author()?->get_name() ?? 'Unknown RSS Author',
                    sourceName: $feed->get_title() ?? 'RSS Feed',
                    publishedAt: \Carbon\Carbon::parse($item->get_date('Y-m-d H:i:s')),
                    type: \App\Newsroom\Enums\SignalType::RSS_ITEM,
                    metadata: [
                        'feed_url' => $feedUrl,
                        'categories' => $item->get_categories(),
                    ],
                    originalId: $item->get_id()
                ));
            }

            $this->logActivity("Scanned {$items->count()} signals from {$feedUrl}");
            return $items;

        } catch (\Exception $e) {
            $this->logError("Scan failed: " . $e->getMessage());
            return collect();
        }
    }
}

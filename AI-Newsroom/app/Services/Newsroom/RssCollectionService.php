<?php

namespace App\Services\Newsroom;

use App\Models\RawContent;
use App\Models\CollectionMethod;
use SimplePie\SimplePie;
use Illuminate\Support\Facades\Log;

class RssCollectionService
{
    public function collect(CollectionMethod $method): array
    {
        Log::info('RSS Collection', ['source' => $method->source->name]);

        try {
            $feed = new SimplePie();
            $feed->set_feed_url($method->endpoint_url);
            $feed->set_cache_location(storage_path('app/rss-cache'));
            $feed->enable_cache(true);
            $feed->init();

            if ($feed->error()) throw new \Exception("Feed error: " . $feed->error());

            $stored = [];
            $duplicates = 0;

            foreach ($feed->get_items() as $item) {
                $title = trim($item->get_title() ?? '');
                $url = $item->get_permalink();
                if (empty($title)) continue;

                $hash = RawContent::generateContentHash($title, $url);
                if (RawContent::isDuplicate($hash, $method->source->community_id)) {
                    $duplicates++;
                    continue;
                }

                $content = $item->get_content() ?: $item->get_description() ?: '';
                $images = [];
                if (preg_match_all('/<img[^>]+src=["\']([^"\']+)["\']/', $content, $m)) {
                    $images = array_slice($m[1], 0, 5);
                }

                $stored[] = RawContent::create([
                    'source_id' => $method->source_id,
                    'collection_method_id' => $method->id,
                    'community_id' => $method->source->community_id,
                    'region_id' => $method->source->region_id,
                    'source_url' => $url,
                    'source_title' => $title,
                    'source_content' => strip_tags($content),
                    'source_html' => $content,
                    'source_excerpt' => strip_tags($item->get_description() ?: ''),
                    'source_published_at' => $item->get_date('Y-m-d H:i:s'),
                    'source_author' => $item->get_author()?->get_name(),
                    'source_images' => $images,
                    'content_hash' => $hash,
                    'title_hash' => RawContent::generateTitleHash($title),
                    'collection_method' => 'rss',
                    'raw_metadata' => ['guid' => $item->get_id()],
                ]);
            }

            $method->recordCollection(count($stored), $duplicates);
            return $stored;

        } catch (\Exception $e) {
            Log::error('RSS failed', ['error' => $e->getMessage()]);
            $method->recordFailure($e->getMessage());
            throw $e;
        }
    }
}

<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\Community;
use App\Models\RawContent;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class WireServiceCollectionService
{
    private const DATELINE_PATTERN = '/^([A-Z][A-Za-z\s\.]+),\s*([A-Z]{2})\s*[-–—]/';

    /**
     * @return array{feeds_polled: int, items_found: int, items_new: int, geographic_matches: int}
     */
    public function pollAllFeeds(): array
    {
        $feeds = DB::table('wire_service_feeds')->where('is_enabled', true)->get();
        $totalStats = ['feeds_polled' => 0, 'items_found' => 0, 'items_new' => 0, 'geographic_matches' => 0];

        foreach ($feeds as $feed) {
            try {
                $stats = $this->pollFeed($feed);
                $totalStats['feeds_polled']++;
                $totalStats['items_found'] += $stats['items_found'];
                $totalStats['items_new'] += $stats['items_new'];
                $totalStats['geographic_matches'] += $stats['geographic_matches'];
            } catch (Exception $e) {
                Log::error('Wire service feed poll failed', ['feed' => $feed->name, 'error' => $e->getMessage()]);
            }
        }

        return $totalStats;
    }

    /**
     * @return array{items_found: int, items_new: int, geographic_matches: int}
     */
    public function pollFeed(object $feed): array
    {
        $runId = (string) \Illuminate\Support\Str::uuid();
        DB::table('wire_service_runs')->insert([
            'id' => $runId,
            'feed_id' => $feed->id,
            'started_at' => now(),
            'items_found' => 0,
        ]);

        try {
            $response = Http::timeout(30)->get($feed->feed_url);
            if (! $response->successful()) {
                throw new Exception("HTTP {$response->status()}");
            }

            $items = $this->parseRssFeed($response->body());
            $stats = ['items_found' => count($items), 'items_new' => 0, 'geographic_matches' => 0];

            foreach ($items as $item) {
                $hash = hash('sha256', ($item['title'] ?? '').'|'.($item['link'] ?? ''));
                if (RawContent::where('content_hash', $hash)->exists()) {
                    continue;
                }

                $geo = $this->parseDateline($item['content'] ?? $item['description'] ?? '');

                $communityId = null;
                $regionId = null;
                if ($geo) {
                    $community = Community::whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($geo['city']).'%'])
                        ->where(function ($q) use ($geo) {
                            $q->where('state', $geo['state'])
                                ->orWhere('state_code', $geo['state']);
                        })
                        ->first();

                    if ($community) {
                        $communityId = $community->id;
                        $regionId = $community->regions()->first()?->id;
                        $stats['geographic_matches']++;
                    }
                }

                $geoFilters = json_decode($feed->geographic_filters ?? '[]', true);
                if (! empty($geoFilters) && $geo && ! in_array($geo['state'], $geoFilters)) {
                    continue;
                }

                RawContent::create([
                    'source_url' => $item['link'] ?? null,
                    'source_title' => $item['title'] ?? 'Untitled',
                    'source_content' => $item['content'] ?? $item['description'] ?? '',
                    'source_excerpt' => mb_substr($item['description'] ?? '', 0, 500),
                    'source_published_at' => isset($item['pubDate']) ? Carbon::parse($item['pubDate']) : now(),
                    'content_hash' => $hash,
                    'collected_at' => now(),
                    'collection_method' => 'wire_service',
                    'community_id' => $communityId,
                    'region_id' => $regionId,
                    'raw_metadata' => ['wire_service' => $feed->service_provider, 'dateline' => $geo],
                    'classification_status' => RawContent::CLASS_PENDING,
                    'processing_status' => RawContent::PROC_PENDING,
                ]);

                $stats['items_new']++;
            }

            DB::table('wire_service_feeds')->where('id', $feed->id)->update(['last_polled_at' => now()]);
            DB::table('wire_service_runs')->where('id', $runId)->update([
                'completed_at' => now(),
                'items_found' => $stats['items_found'],
                'items_new' => $stats['items_new'],
                'items_geographic_match' => $stats['geographic_matches'],
            ]);

            return $stats;
        } catch (Exception $e) {
            DB::table('wire_service_runs')->where('id', $runId)->update([
                'completed_at' => now(),
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function parseDateline(string $content): ?array
    {
        if (preg_match(self::DATELINE_PATTERN, $content, $matches)) {
            return ['city' => mb_trim($matches[1]), 'state' => mb_trim($matches[2])];
        }

        return null;
    }

    private function parseRssFeed(string $xml): array
    {
        $items = [];
        try {
            $rss = simplexml_load_string($xml);
            if (! $rss) {
                return [];
            }

            $channel = $rss->channel ?? $rss;
            $itemList = $channel->item ?? [];
            foreach ($itemList as $item) {
                $items[] = [
                    'title' => (string) $item->title,
                    'link' => (string) $item->link,
                    'description' => (string) $item->description,
                    'content' => (string) ($item->children('content', true)->encoded ?? $item->description),
                    'pubDate' => (string) $item->pubDate,
                ];
            }
        } catch (Exception $e) {
            Log::warning('RSS parse failed', ['error' => $e->getMessage()]);
        }

        return $items;
    }
}

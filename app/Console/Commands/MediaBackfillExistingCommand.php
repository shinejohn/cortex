<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Business;
use App\Models\DayNewsPost;
use App\Models\MediaAsset;
use App\Models\NewsArticleDraft;
use App\Services\MediaLibraryService;
use Illuminate\Console\Command;

final class MediaBackfillExistingCommand extends Command
{
    protected $signature = 'media:backfill-existing
                            {--businesses : Backfill from businesses.images}
                            {--drafts : Backfill from news_article_drafts}
                            {--posts : Backfill from day_news_posts}
                            {--all : Backfill from all sources (default)}
                            {--score : Run quality scoring on backfilled assets}';

    protected $description = 'Backfill existing images from businesses, drafts, and posts into the media_assets registry';

    public function handle(MediaLibraryService $mediaLibrary): int
    {
        $all = $this->option('all');
        $businesses = $this->option('businesses') || $all;
        $drafts = $this->option('drafts') || $all;
        $posts = $this->option('posts') || $all;

        if (! $businesses && ! $drafts && ! $posts) {
            $businesses = $drafts = $posts = true;
        }

        $total = 0;

        if ($businesses) {
            $total += $this->backfillBusinesses($mediaLibrary);
        }

        if ($drafts) {
            $total += $this->backfillDrafts();
        }

        if ($posts) {
            $total += $this->backfillPosts();
        }

        if ($this->option('score') && $total > 0) {
            $this->info('Running quality scoring on backfilled assets...');
            $scored = MediaAsset::whereNotNull('quality_score')->orWhere('quality_score', 0)->count();
            MediaAsset::chunk(100, function ($assets) use ($mediaLibrary) {
                foreach ($assets as $asset) {
                    $mediaLibrary->scoreQuality($asset);
                }
            });
            $this->info("Scored {$scored} assets.");
        }

        $this->info("Backfill complete. Total assets registered: {$total}");

        return self::SUCCESS;
    }

    private function backfillBusinesses(MediaLibraryService $mediaLibrary): int
    {
        $this->info('Backfilling from businesses.images...');

        $count = 0;

        Business::whereNotNull('images')
            ->whereJsonLength('images', '>', 0)
            ->with('regions')
            ->chunk(100, function ($businesses) use ($mediaLibrary, &$count) {
                foreach ($businesses as $business) {
                    $photos = $business->images;
                    if (empty($photos) || ! is_array($photos)) {
                        continue;
                    }

                    $regionId = $business->regions->first()?->id;
                    $mediaLibrary->registerGooglePlacesPhotos($photos, $business, $regionId);
                    $count += count($photos);
                }
            });

        $this->info("  Registered {$count} business photos.");

        return $count;
    }

    private function backfillDrafts(): int
    {
        $this->info('Backfilling from news_article_drafts...');

        $count = 0;

        NewsArticleDraft::whereNotNull('featured_image_path')
            ->with('region')
            ->chunk(100, function ($drafts) use (&$count) {
                foreach ($drafts as $draft) {
                    $seo = $draft->seo_metadata ?? [];

                    $asset = MediaAsset::firstOrCreate(
                        ['storage_path' => $draft->featured_image_path],
                        [
                            'storage_disk' => $draft->featured_image_disk ?? 'public',
                            'storage_path' => $draft->featured_image_path,
                            'public_url' => $draft->featured_image_url ?? null,
                            'source_type' => MediaAsset::SOURCE_UNSPLASH,
                            'source_id' => 'backfill-draft-'.$draft->id,
                            'license_type' => MediaAsset::LICENSE_UNSPLASH,
                            'requires_attribution' => true,
                            'photographer_name' => $seo['image_photographer'] ?? null,
                            'attribution_html' => $seo['image_attribution'] ?? null,
                            'alt_text' => $seo['image_alt'] ?? null,
                            'region_id' => $draft->region_id,
                            'quality_score' => 70,
                            'is_approved' => true,
                            'is_local' => false,
                            'status' => 'active',
                        ]
                    );

                    if ($asset->wasRecentlyCreated) {
                        $count++;
                    }
                }
            });

        $this->info("  Registered {$count} draft images.");

        return $count;
    }

    private function backfillPosts(): int
    {
        $this->info('Backfilling from day_news_posts...');

        $count = 0;

        DayNewsPost::whereNotNull('featured_image_path')
            ->chunk(100, function ($posts) use (&$count) {
                foreach ($posts as $post) {
                    $metadata = $post->metadata ?? [];

                    $asset = MediaAsset::firstOrCreate(
                        ['storage_path' => $post->featured_image_path],
                        [
                            'storage_disk' => $post->featured_image_disk ?? 'public',
                            'storage_path' => $post->featured_image_path,
                            'public_url' => $post->featured_image ?? null,
                            'source_type' => MediaAsset::SOURCE_UNSPLASH,
                            'source_id' => 'backfill-post-'.$post->id,
                            'license_type' => MediaAsset::LICENSE_UNSPLASH,
                            'requires_attribution' => true,
                            'photographer_name' => $metadata['image_photographer'] ?? null,
                            'attribution_html' => $metadata['image_attribution'] ?? null,
                            'alt_text' => $metadata['image_alt'] ?? null,
                            'region_id' => $post->regions()->first()?->id,
                            'quality_score' => 70,
                            'is_approved' => true,
                            'is_local' => false,
                            'status' => 'active',
                        ]
                    );

                    if ($asset->wasRecentlyCreated) {
                        $count++;
                    }
                }
            });

        $this->info("  Registered {$count} post images.");

        return $count;
    }
}

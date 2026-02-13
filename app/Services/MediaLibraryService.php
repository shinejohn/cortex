<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Business;
use App\Models\MediaAsset;
use App\Models\Region;
use App\Services\News\ImageStorageService;
use App\Services\News\UnsplashService;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

final class MediaLibraryService
{
    public function __construct(
        private readonly ImageStorageService $imageStorage,
        private readonly UnsplashService $unsplash,
    ) {}

    /**
     * Find the best image for an article.
     *
     * Priority order:
     * 1. Existing local/community photos matching tags + region (free, authentic)
     * 2. Google Places photos from mentioned businesses (already downloaded, relevant)
     * 3. Unsplash search (costs API call, but high quality)
     * 4. Picsum fallback (last resort, generic)
     */
    public function findImageForArticle(
        array $keywords,
        ?string $regionId = null,
        ?string $businessId = null,
    ): ?MediaAsset {
        $existing = $this->searchExisting($keywords, $regionId, $businessId);
        if ($existing) {
            Log::info('MediaLibrary: Reusing existing image', [
                'asset_id' => $existing->id,
                'source' => $existing->source_type,
                'tags' => $existing->tags,
            ]);

            return $existing;
        }

        if ($businessId) {
            $businessImage = $this->findBusinessImage($businessId);
            if ($businessImage) {
                Log::info('MediaLibrary: Using business photo', [
                    'asset_id' => $businessImage->id,
                    'business_id' => $businessId,
                ]);

                return $businessImage;
            }
        }

        $unsplashImage = $this->searchAndStoreFromUnsplash($keywords, $regionId);
        if ($unsplashImage) {
            return $unsplashImage;
        }

        return $this->createPicsumFallback($regionId);
    }

    /**
     * Search existing images in our library.
     */
    public function searchExisting(
        array $keywords,
        ?string $regionId = null,
        ?string $businessId = null,
    ): ?MediaAsset {
        $query = MediaAsset::where('status', 'active')
            ->where('is_approved', true)
            ->where(function ($q) {
                $q->where('width', '>=', 800)
                    ->orWhereNull('width');
            });

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        if ($businessId) {
            $businessMatch = (clone $query)
                ->where('business_id', $businessId)
                ->orderByDesc('quality_score')
                ->first();
            if ($businessMatch) {
                return $businessMatch;
            }
        }

        $cleanKeywords = array_map(fn ($k) => mb_strtolower(mb_trim((string) $k)), $keywords);
        $cleanKeywords = array_filter($cleanKeywords, fn ($k) => mb_strlen($k) > 2);

        if (empty($cleanKeywords)) {
            return null;
        }

        $tagMatch = (clone $query)
            ->where(function ($q) use ($cleanKeywords) {
                foreach ($cleanKeywords as $keyword) {
                    $q->orWhereJsonContains('tags', $keyword);
                }
            })
            ->orderByDesc('quality_score')
            ->orderByDesc('is_local')
            ->orderBy('usage_count')
            ->first();

        return $tagMatch;
    }

    /**
     * Find images for a business from our library.
     */
    public function findBusinessImage(string $businessId): ?MediaAsset
    {
        return MediaAsset::where('business_id', $businessId)
            ->where('status', 'active')
            ->where('is_approved', true)
            ->orderByDesc('quality_score')
            ->orderBy('usage_count')
            ->first();
    }

    /**
     * Register an Unsplash image into the media library.
     */
    public function registerUnsplashImage(array $imageData, ?string $regionId = null): MediaAsset
    {
        $appName = urlencode(config('app.name', 'DayNews'));

        $photographerUrl = $imageData['photographer_url'] ?? '';
        if ($photographerUrl && ! str_contains($photographerUrl, 'utm_source')) {
            $photographerUrl .= (str_contains($photographerUrl, '?') ? '&' : '?')."utm_source={$appName}&utm_medium=referral";
        }

        return MediaAsset::updateOrCreate(
            ['source_type' => MediaAsset::SOURCE_UNSPLASH, 'source_id' => $imageData['photo_id'] ?? null],
            [
                'storage_disk' => $imageData['storage_disk'] ?? 'public',
                'storage_path' => $imageData['storage_path'] ?? null,
                'public_url' => $imageData['public_url'] ?? $imageData['url'] ?? null,
                'thumb_url' => $imageData['thumb_url'] ?? null,
                'small_url' => $imageData['small_url'] ?? null,
                'original_url' => $imageData['url'] ?? null,
                'width' => $imageData['width'] ?? null,
                'height' => $imageData['height'] ?? null,
                'dominant_color' => $imageData['color'] ?? null,
                'source_type' => MediaAsset::SOURCE_UNSPLASH,
                'source_id' => $imageData['photo_id'] ?? null,
                'license_type' => MediaAsset::LICENSE_UNSPLASH,
                'requires_attribution' => true,
                'photographer_name' => $imageData['photographer_name'] ?? null,
                'photographer_url' => $photographerUrl,
                'source_platform_name' => 'Unsplash',
                'source_platform_url' => "https://unsplash.com/?utm_source={$appName}&utm_medium=referral",
                'attribution_html' => $imageData['attribution'] ?? null,
                'alt_text' => $imageData['alt_description'] ?? null,
                'region_id' => $regionId,
                'quality_score' => 75,
                'is_approved' => true,
                'is_local' => false,
                'status' => 'active',
            ]
        );
    }

    /**
     * Register Google Places photos into the media library.
     */
    public function registerGooglePlacesPhotos(
        array $photos,
        Business $business,
        ?string $regionId = null,
    ): Collection {
        $assets = collect();

        foreach ($photos as $photo) {
            $attributions = $photo['attributions'] ?? [];
            $firstAttribution = $attributions[0] ?? [];

            $asset = MediaAsset::updateOrCreate(
                ['source_type' => MediaAsset::SOURCE_GOOGLE_PLACES, 'source_id' => $photo['photo_id'] ?? null],
                [
                    'storage_disk' => $photo['storage_disk'] ?? 'public',
                    'storage_path' => $photo['storage_path'] ?? null,
                    'public_url' => $photo['public_url'] ?? null,
                    'original_url' => null,
                    'width' => $photo['width'] ?? null,
                    'height' => $photo['height'] ?? null,
                    'source_type' => MediaAsset::SOURCE_GOOGLE_PLACES,
                    'source_id' => $photo['photo_id'] ?? null,
                    'license_type' => MediaAsset::LICENSE_GOOGLE_PLACES,
                    'requires_attribution' => true,
                    'raw_attributions' => $attributions,
                    'photographer_name' => $firstAttribution['displayName'] ?? null,
                    'photographer_url' => $firstAttribution['uri'] ?? null,
                    'source_platform_name' => 'Google',
                    'alt_text' => $business->name,
                    'tags' => $this->generateBusinessTags($business),
                    'category' => 'business',
                    'subcategory' => $business->primary_type,
                    'region_id' => $regionId,
                    'business_id' => $business->id,
                    'google_place_id' => $business->google_place_id,
                    'latitude' => $business->latitude,
                    'longitude' => $business->longitude,
                    'location_name' => $business->name,
                    'quality_score' => 60,
                    'is_approved' => true,
                    'is_local' => true,
                    'status' => 'active',
                ]
            );

            $assets->push($asset);
        }

        return $assets;
    }

    /**
     * Register a user-uploaded community photo.
     */
    public function registerUserUpload(
        string $storagePath,
        string $disk,
        string $userId,
        array $metadata = [],
    ): MediaAsset {
        $dimensions = $this->getImageDimensions($storagePath, $disk);

        $content = Storage::disk($disk)->get($storagePath);
        $hash = hash('sha256', $content);

        $existing = MediaAsset::where('file_hash', $hash)->first();
        if ($existing) {
            Log::info('MediaLibrary: Duplicate upload detected', [
                'existing_id' => $existing->id,
                'user_id' => $userId,
            ]);

            return $existing;
        }

        return MediaAsset::create([
            'storage_disk' => $disk,
            'storage_path' => $storagePath,
            'public_url' => Storage::disk($disk)->url($storagePath),
            'file_hash' => $hash,
            'width' => $dimensions['width'] ?? null,
            'height' => $dimensions['height'] ?? null,
            'file_size_bytes' => mb_strlen($content),
            'mime_type' => Storage::disk($disk)->mimeType($storagePath) ?? 'image/jpeg',
            'source_type' => MediaAsset::SOURCE_USER_UPLOAD,
            'license_type' => MediaAsset::LICENSE_USER_GRANTED,
            'requires_attribution' => false,
            'photographer_name' => $metadata['photographer_name'] ?? null,
            'source_platform_name' => 'Community Upload',
            'alt_text' => $metadata['alt_text'] ?? $metadata['caption'] ?? null,
            'description' => $metadata['description'] ?? null,
            'tags' => $metadata['tags'] ?? [],
            'category' => $metadata['category'] ?? 'community',
            'region_id' => $metadata['region_id'] ?? null,
            'latitude' => $metadata['latitude'] ?? null,
            'longitude' => $metadata['longitude'] ?? null,
            'location_name' => $metadata['location_name'] ?? null,
            'uploaded_by_user_id' => $userId,
            'quality_score' => null,
            'is_approved' => false,
            'is_local' => true,
            'status' => 'active',
        ]);
    }

    /**
     * Score image quality.
     */
    public function scoreQuality(MediaAsset $asset): int
    {
        $score = 50;

        if ($asset->width) {
            if ($asset->width >= 1200) {
                $score += 20;
            } elseif ($asset->width >= 800) {
                $score += 10;
            } elseif ($asset->width < 600) {
                $score -= 20;
            }
        }

        if ($asset->width && $asset->height && $asset->width > $asset->height) {
            $score += 5;
        }

        $sourceBonus = match ($asset->source_type) {
            MediaAsset::SOURCE_UNSPLASH => 15,
            MediaAsset::SOURCE_USER_UPLOAD => 10,
            MediaAsset::SOURCE_GOOGLE_PLACES => 5,
            MediaAsset::SOURCE_SCRAPE => -5,
            MediaAsset::SOURCE_PICSUM => -15,
            default => 0,
        };
        $score += $sourceBonus;

        if ($asset->is_local) {
            $score += 10;
        }

        if (! empty($asset->tags)) {
            $score += 5;
        }
        if (! empty($asset->alt_text)) {
            $score += 3;
        }

        $score = max(0, min(100, $score));

        $asset->update(['quality_score' => $score]);

        return $score;
    }

    private function searchAndStoreFromUnsplash(array $keywords, ?string $regionId): ?MediaAsset
    {
        $orientation = config('news-workflow.unsplash.orientation', 'landscape');
        $imageData = $this->unsplash->searchImage($keywords, $orientation);

        if (! $imageData || ($imageData['is_fallback'] ?? false)) {
            return null;
        }

        $asset = $this->registerUnsplashImage($imageData, $regionId);

        $tags = array_map(fn ($k) => mb_strtolower(mb_trim((string) $k)), $keywords);
        $existingTags = $asset->tags ?? [];
        $asset->update([
            'tags' => array_values(array_unique(array_merge($existingTags, $tags))),
        ]);

        return $asset;
    }

    private function createPicsumFallback(?string $regionId): ?MediaAsset
    {
        $orientation = config('news-workflow.unsplash.orientation', 'landscape');
        $imageData = $this->unsplash->getRandomImage('local community', $orientation);

        if (! $imageData) {
            return null;
        }

        $storagePath = $imageData['storage_path'] ?? null;
        $storageDisk = $imageData['storage_disk'] ?? ($storagePath ? 'public' : null);

        return MediaAsset::create([
            'storage_disk' => $storageDisk,
            'storage_path' => $storagePath,
            'public_url' => $imageData['public_url'] ?? $imageData['url'] ?? null,
            'thumb_url' => $imageData['thumb_url'] ?? null,
            'width' => $imageData['width'] ?? 1200,
            'height' => $imageData['height'] ?? 800,
            'source_type' => ($imageData['is_fallback'] ?? false) ? MediaAsset::SOURCE_PICSUM : MediaAsset::SOURCE_UNSPLASH,
            'source_id' => $imageData['photo_id'] ?? 'picsum-'.time(),
            'license_type' => ($imageData['is_fallback'] ?? false) ? MediaAsset::LICENSE_CC0 : MediaAsset::LICENSE_UNSPLASH,
            'requires_attribution' => ! ($imageData['is_fallback'] ?? false),
            'attribution_html' => $imageData['attribution'] ?? null,
            'region_id' => $regionId,
            'quality_score' => 30,
            'is_approved' => true,
            'is_local' => false,
            'status' => 'active',
        ]);
    }

    /**
     * @return array<string, string|null>
     */
    private function generateBusinessTags(Business $business): array
    {
        $tags = [];

        if ($business->name) {
            $tags[] = mb_strtolower($business->name);
        }
        if ($business->primary_type) {
            $tags[] = str_replace('_', ' ', $business->primary_type);
        }
        if ($business->city) {
            $tags[] = mb_strtolower($business->city);
        }
        foreach ($business->categories ?? [] as $cat) {
            $tags[] = str_replace('_', ' ', (string) $cat);
        }

        return array_values(array_unique($tags));
    }

    /**
     * @return array{width: int|null, height: int|null}
     */
    private function getImageDimensions(string $path, string $disk): array
    {
        try {
            $content = Storage::disk($disk)->get($path);
            $image = @getimagesizefromstring($content);
            if ($image) {
                return ['width' => $image[0], 'height' => $image[1]];
            }
        } catch (Exception $e) {
            // Silent fail — dimensions are nice-to-have
        }

        return ['width' => null, 'height' => null];
    }
}

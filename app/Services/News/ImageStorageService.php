<?php

declare(strict_types=1);

namespace App\Services\News;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

final class ImageStorageService
{
    /**
     * Download an image from a URL and store it in the configured storage disk.
     *
     * @param  string  $url  The URL of the image to download
     * @param  string  $photoId  The unique identifier for the photo (used in filename)
     * @param  string|null  $extension  The file extension (default: jpg)
     * @return array Returns storage metadata: ['storage_path', 'storage_disk', 'public_url']
     *
     * @throws Exception If download or storage fails
     */
    public function downloadAndStore(string $url, string $photoId, ?string $extension = 'jpg'): array
    {
        $disk = config('news-workflow.unsplash.storage.disk', 'public');
        $basePath = config('news-workflow.unsplash.storage.path', 'news-images');

        try {
            // Download the image from the URL
            Log::debug('Downloading image', ['url' => $url, 'photo_id' => $photoId]);

            $response = Http::timeout(30)->get($url);

            if ($response->failed()) {
                throw new Exception("Failed to download image from URL: HTTP {$response->status()}");
            }

            $imageContent = $response->body();

            if (empty($imageContent)) {
                throw new Exception('Downloaded image content is empty');
            }

            // Generate storage path: news-images/{year}/{month}/{photoId}.{ext}
            $year = date('Y');
            $month = date('m');
            $filename = "{$photoId}.{$extension}";
            $storagePath = "{$basePath}/{$year}/{$month}/{$filename}";

            // Store the image
            Log::debug('Storing image to disk', [
                'disk' => $disk,
                'path' => $storagePath,
                'size' => mb_strlen($imageContent),
            ]);

            $stored = Storage::disk($disk)->put($storagePath, $imageContent);

            if (! $stored) {
                throw new Exception('Failed to store image to disk');
            }

            // Get the public URL
            $publicUrl = Storage::disk($disk)->url($storagePath);

            Log::info('Image successfully downloaded and stored', [
                'photo_id' => $photoId,
                'disk' => $disk,
                'path' => $storagePath,
            ]);

            return [
                'storage_path' => $storagePath,
                'storage_disk' => $disk,
                'public_url' => $publicUrl,
            ];
        } catch (Exception $e) {
            Log::error('Image download and storage failed', [
                'url' => $url,
                'photo_id' => $photoId,
                'error' => $e->getMessage(),
            ]);

            throw new Exception("Image storage failed: {$e->getMessage()}", 0, $e);
        }
    }
}

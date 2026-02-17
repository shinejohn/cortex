<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class UnsplashService
{
    private string $baseUrl = 'https://api.unsplash.com';

    private ?string $accessKey;

    public function __construct()
    {
        $this->accessKey = config('services.unsplash.access_key');
    }

    /**
     * Search for photos based on a query.
     */
    public function searchPhotos(string $query, int $perPage = 10): array
    {
        if (! $this->accessKey) {
            return [];
        }

        try {
            $response = Http::get("{$this->baseUrl}/search/photos", [
                'client_id' => $this->accessKey,
                'query' => $query,
                'per_page' => $perPage,
                'orientation' => 'landscape',
            ]);

            if ($response->successful()) {
                return $response->json()['results'] ?? [];
            }
        } catch (Exception $e) {
            Log::error('Unsplash API Error: '.$e->getMessage());
        }

        return [];
    }

    /**
     * Get a single random photo, optionally filtered by query.
     */
    public function getRandomPhoto(?string $query = null): ?array
    {
        if (! $this->accessKey) {
            return null;
        }

        try {
            $params = [
                'client_id' => $this->accessKey,
                'orientation' => 'landscape',
            ];

            if ($query) {
                $params['query'] = $query;
            }

            $response = Http::get("{$this->baseUrl}/photos/random", $params);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (Exception $e) {
            Log::error('Unsplash Random Photo Error: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Trigger a download event (required by Unsplash API guidelines).
     */
    public function trackDownload(string $downloadLocation): void
    {
        if (! $this->accessKey || ! $downloadLocation) {
            return;
        }

        try {
            Http::get($downloadLocation, [
                'client_id' => $this->accessKey,
            ]);
        } catch (Exception $e) {
            // fail silently for tracking
        }
    }
}

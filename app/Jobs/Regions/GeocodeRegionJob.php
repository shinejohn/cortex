<?php

declare(strict_types=1);

namespace App\Jobs\Regions;

use App\Models\Region;
use App\Services\GeocodingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

final class GeocodeRegionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;

    public int $tries = 3;

    public int $backoff = 10;

    public function __construct(
        public Region $region
    ) {}

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [
            new RateLimited('geocoding'),
        ];
    }

    public function handle(GeocodingService $geocodingService): void
    {
        // Skip if region already has coordinates
        if ($this->region->latitude !== null && $this->region->longitude !== null) {
            Log::info('GeocodeRegionJob: Region already has coordinates, skipping', [
                'region_id' => $this->region->id,
                'region_name' => $this->region->name,
            ]);

            return;
        }

        Log::info('GeocodeRegionJob: Starting geocoding', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'region_type' => $this->region->type,
        ]);

        $success = $geocodingService->geocodeRegion($this->region);

        if ($success) {
            Log::info('GeocodeRegionJob: Geocoding completed', [
                'region_id' => $this->region->id,
                'latitude' => $this->region->fresh()->latitude,
                'longitude' => $this->region->fresh()->longitude,
            ]);
        } else {
            Log::warning('GeocodeRegionJob: Geocoding failed', [
                'region_id' => $this->region->id,
                'region_name' => $this->region->name,
            ]);
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('GeocodeRegionJob: Job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}

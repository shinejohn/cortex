<?php

declare(strict_types=1);

use App\Contracts\GeocodingServiceInterface;
use App\Jobs\Regions\GeocodeRegionJob;
use App\Models\Region;
use Illuminate\Support\Facades\Queue;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('GeocodeRegionsCommand', function () {
    it('reports no regions when none are missing coordinates', function () {
        Region::factory()->create([
            'latitude' => 29.6516,
            'longitude' => -82.3248,
        ]);

        $this->artisan('regions:geocode')
            ->expectsOutput('No regions found missing coordinates.')
            ->assertSuccessful();
    });

    it('finds regions missing latitude', function () {
        Region::factory()->create([
            'name' => 'Test Region',
            'latitude' => null,
            'longitude' => -82.3248,
        ]);

        $this->artisan('regions:geocode', ['--dry-run' => true])
            ->expectsOutput('Found 1 regions missing coordinates.')
            ->assertSuccessful();
    });

    it('finds regions missing longitude', function () {
        Region::factory()->create([
            'name' => 'Test Region',
            'latitude' => 29.6516,
            'longitude' => null,
        ]);

        $this->artisan('regions:geocode', ['--dry-run' => true])
            ->expectsOutput('Found 1 regions missing coordinates.')
            ->assertSuccessful();
    });

    it('filters by region type', function () {
        Region::factory()->create([
            'name' => 'Florida',
            'type' => 'state',
            'latitude' => null,
            'longitude' => null,
        ]);
        Region::factory()->create([
            'name' => 'Miami',
            'type' => 'city',
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->artisan('regions:geocode', ['--type' => 'city', '--dry-run' => true])
            ->expectsOutput('Found 1 regions missing coordinates.')
            ->assertSuccessful();
    });

    it('rejects invalid region type', function () {
        Region::factory()->create([
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->artisan('regions:geocode', ['--type' => 'invalid', '--dry-run' => true])
            ->expectsOutput('Invalid type: invalid. Valid types: state, county, city, neighborhood')
            ->assertSuccessful();
    });

    it('dispatches jobs to queue by default', function () {
        Queue::fake();

        Region::factory()->create([
            'name' => 'Test City',
            'type' => 'city',
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->artisan('regions:geocode')
            ->expectsOutput('Found 1 regions missing coordinates.')
            ->assertSuccessful();

        Queue::assertPushed(GeocodeRegionJob::class, 1);
    });

    it('dispatches multiple jobs with delay', function () {
        Queue::fake();

        Region::factory()->count(3)->create([
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->artisan('regions:geocode', ['--delay' => 5])
            ->expectsOutput('Found 3 regions missing coordinates.')
            ->expectsOutput('Dispatching jobs with 5 second delay between each...')
            ->assertSuccessful();

        Queue::assertPushed(GeocodeRegionJob::class, 3);
    });

    it('processes synchronously when sync flag is used', function () {
        $geocodingService = $this->mock(GeocodingServiceInterface::class);
        $geocodingService->shouldReceive('geocodeRegion')
            ->once()
            ->andReturn(true);

        Region::factory()->create([
            'name' => 'Test City',
            'type' => 'city',
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->artisan('regions:geocode', ['--sync' => true])
            ->expectsOutput('Found 1 regions missing coordinates.')
            ->expectsOutput('Processing synchronously...')
            ->assertSuccessful();
    });

    it('tracks success and failure counts in sync mode', function () {
        $regions = Region::factory()->count(2)->create([
            'latitude' => null,
            'longitude' => null,
        ]);

        $geocodingService = $this->mock(GeocodingServiceInterface::class);
        $geocodingService->shouldReceive('geocodeRegion')
            ->with(Mockery::on(fn ($r) => $r->id === $regions[0]->id))
            ->once()
            ->andReturn(true);
        $geocodingService->shouldReceive('geocodeRegion')
            ->with(Mockery::on(fn ($r) => $r->id === $regions[1]->id))
            ->once()
            ->andReturn(false);

        $this->artisan('regions:geocode', ['--sync' => true])
            ->assertSuccessful();
    });

    it('displays dry run summary by type', function () {
        Region::factory()->create([
            'name' => 'Florida',
            'type' => 'state',
            'latitude' => null,
            'longitude' => null,
        ]);
        Region::factory()->create([
            'name' => 'Orange County',
            'type' => 'county',
            'latitude' => null,
            'longitude' => null,
        ]);
        Region::factory()->count(2)->create([
            'type' => 'city',
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->artisan('regions:geocode', ['--dry-run' => true])
            ->expectsOutput('Found 4 regions missing coordinates.')
            ->expectsOutput('=== Dry Run Mode ===')
            ->assertSuccessful();
    });

    it('skips regions that already have coordinates', function () {
        Queue::fake();

        Region::factory()->create([
            'name' => 'Has Coords',
            'latitude' => 29.6516,
            'longitude' => -82.3248,
        ]);
        Region::factory()->create([
            'name' => 'Missing Coords',
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->artisan('regions:geocode')
            ->expectsOutput('Found 1 regions missing coordinates.')
            ->assertSuccessful();

        Queue::assertPushed(GeocodeRegionJob::class, 1);
    });
});

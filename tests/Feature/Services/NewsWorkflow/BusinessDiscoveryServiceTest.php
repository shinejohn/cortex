<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\Region;
use App\Services\News\BusinessDiscoveryService;
use App\Services\News\SerpApiService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->serpApiMock = \Mockery::mock(SerpApiService::class);
    $this->service = new BusinessDiscoveryService($this->serpApiMock);
});

it('discovers businesses for a region', function () {
    $region = Region::factory()->create([
        'name' => 'Test City',
        'latitude' => 42.3314,
        'longitude' => -83.0458,
    ]);

    $mockBusinessData = [
        [
            'google_place_id' => 'ChIJ123ABC',
            'name' => 'Test Restaurant',
            'description' => 'Great food',
            'address' => '123 Main St',
            'latitude' => 42.3314,
            'longitude' => -83.0458,
            'rating' => 4.5,
            'reviews_count' => 100,
            'phone' => '555-1234',
            'website' => 'https://example.com',
            'categories' => ['restaurant'],
            'opening_hours' => ['Mon-Fri: 9-5'],
            'serp_metadata' => ['test' => 'data'],
        ],
    ];

    $this->serpApiMock
        ->shouldReceive('discoverBusinesses')
        ->once()
        ->with($region, \Mockery::type('array'))
        ->andReturn($mockBusinessData);

    $count = $this->service->discoverForRegion($region);

    expect($count)->toBe(1);
    expect(Business::count())->toBe(1);

    $business = Business::first();
    expect($business->name)->toBe('Test Restaurant');
    expect($business->google_place_id)->toBe('ChIJ123ABC');
});

it('returns zero when business discovery is disabled', function () {
    Config::set('news-workflow.business_discovery.enabled', false);

    $region = Region::factory()->create();

    $this->serpApiMock->shouldNotReceive('discoverBusinesses');

    $count = $this->service->discoverForRegion($region);

    expect($count)->toBe(0);
});

it('upserts a business correctly', function () {
    $region = Region::factory()->create();

    $businessData = [
        'google_place_id' => 'ChIJ123ABC',
        'name' => 'Test Cafe',
        'description' => 'Coffee shop',
        'address' => '456 Oak Ave',
        'latitude' => 42.3314,
        'longitude' => -83.0458,
        'rating' => 4.8,
        'reviews_count' => 50,
        'phone' => '555-5678',
        'website' => 'https://cafe.com',
        'categories' => ['cafe'],
        'opening_hours' => ['Mon-Sun: 7-7'],
        'serp_metadata' => ['foo' => 'bar'],
    ];

    $business = $this->service->upsertBusiness($businessData, $region);

    expect($business)->toBeInstanceOf(Business::class);
    expect($business->name)->toBe('Test Cafe');
    expect($business->google_place_id)->toBe('ChIJ123ABC');
    expect(Business::count())->toBe(1);

    // Update the same business
    $updatedData = array_merge($businessData, [
        'name' => 'Updated Cafe Name',
        'rating' => 4.9,
    ]);

    $updatedBusiness = $this->service->upsertBusiness($updatedData, $region);

    expect($updatedBusiness->id)->toBe($business->id);
    expect($updatedBusiness->name)->toBe('Updated Cafe Name');
    expect((float) $updatedBusiness->rating)->toBe(4.9);
    expect(Business::count())->toBe(1); // Still only one business
});

it('throws exception when google_place_id is missing', function () {
    $region = Region::factory()->create();

    $businessData = [
        'google_place_id' => null,
        'name' => 'Test Business',
    ];

    $this->service->upsertBusiness($businessData, $region);
})->throws(Exception::class, 'Business data missing google_place_id');

it('assigns business to region correctly', function () {
    $region = Region::factory()->create();
    $business = Business::factory()->create();

    $this->service->assignToRegion($business, $region);

    $exists = DB::table('business_region')
        ->where('business_id', $business->id)
        ->where('region_id', $region->id)
        ->exists();

    expect($exists)->toBeTrue();
});

it('does not create duplicate business-region relationships', function () {
    $region = Region::factory()->create();
    $business = Business::factory()->create();

    // Assign twice
    $this->service->assignToRegion($business, $region);
    $this->service->assignToRegion($business, $region);

    $count = DB::table('business_region')
        ->where('business_id', $business->id)
        ->where('region_id', $region->id)
        ->count();

    expect($count)->toBe(1);
});

it('handles multiple businesses from SERP API', function () {
    $region = Region::factory()->create();

    $mockBusinessData = [
        [
            'google_place_id' => 'ChIJ111',
            'name' => 'Business 1',
            'description' => null,
            'address' => '111 St',
            'latitude' => 42.0,
            'longitude' => -83.0,
            'rating' => 4.0,
            'reviews_count' => 10,
            'phone' => null,
            'website' => null,
            'categories' => [],
            'opening_hours' => null,
            'serp_metadata' => [],
        ],
        [
            'google_place_id' => 'ChIJ222',
            'name' => 'Business 2',
            'description' => null,
            'address' => '222 St',
            'latitude' => 42.1,
            'longitude' => -83.1,
            'rating' => 3.5,
            'reviews_count' => 20,
            'phone' => null,
            'website' => null,
            'categories' => [],
            'opening_hours' => null,
            'serp_metadata' => [],
        ],
    ];

    $this->serpApiMock
        ->shouldReceive('discoverBusinesses')
        ->once()
        ->andReturn($mockBusinessData);

    $count = $this->service->discoverForRegion($region);

    expect($count)->toBe(2);
    expect(Business::count())->toBe(2);
});

it('continues processing even if one business fails', function () {
    $region = Region::factory()->create();

    $mockBusinessData = [
        [
            'google_place_id' => 'ChIJ111',
            'name' => 'Valid Business',
            'description' => null,
            'address' => '111 St',
            'latitude' => 42.0,
            'longitude' => -83.0,
            'rating' => 4.0,
            'reviews_count' => 10,
            'phone' => null,
            'website' => null,
            'categories' => [],
            'opening_hours' => null,
            'serp_metadata' => [],
        ],
        [
            'google_place_id' => null, // Invalid - missing place_id
            'name' => 'Invalid Business',
        ],
    ];

    $this->serpApiMock
        ->shouldReceive('discoverBusinesses')
        ->once()
        ->andReturn($mockBusinessData);

    $count = $this->service->discoverForRegion($region);

    expect($count)->toBe(1); // Only valid business counted
    expect(Business::count())->toBe(1);
});

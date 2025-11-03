<?php

declare(strict_types=1);

use App\Models\Region;
use App\Models\RegionZipcode;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
    config(['domains.day-news' => 'daynews.test']);

    $this->region = Region::factory()->create([
        'name' => 'Chicago',
        'slug' => 'chicago',
        'type' => 'city',
        'is_active' => true,
        'latitude' => 41.8781,
        'longitude' => -87.6298,
    ]);

    RegionZipcode::create([
        'region_id' => $this->region->id,
        'zipcode' => '60601',
        'is_primary' => true,
    ]);

    $this->baseUrl = 'http://daynews.test';
});

it('can set user region preference', function () {
    $response = postJson($this->baseUrl.'/api/location/set-region', [
        'region_id' => $this->region->id,
    ]);

    $response->assertSuccessful();
    $response->assertJson([
        'success' => true,
        'region' => [
            'id' => $this->region->id,
            'name' => 'Chicago',
            'slug' => 'chicago',
        ],
    ]);

    expect(session('user_location_region_id'))->toBe($this->region->id);
    expect(session('user_location_confirmed'))->toBeTrue();
});

it('validates region id when setting preference', function () {
    $response = postJson($this->baseUrl.'/api/location/set-region', [
        'region_id' => 'invalid-uuid',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['region_id']);
});

it('rejects inactive region when setting preference', function () {
    $inactiveRegion = Region::factory()->create([
        'is_active' => false,
    ]);

    $response = postJson($this->baseUrl.'/api/location/set-region', [
        'region_id' => $inactiveRegion->id,
    ]);

    $response->assertNotFound();
});

it('can search regions by name', function () {
    $response = getJson($this->baseUrl.'/api/location/search?query=Chicago');

    $response->assertSuccessful();
    $response->assertJson([
        'success' => true,
    ]);

    $regions = $response->json('regions');
    expect($regions)->toHaveCount(1);
    expect($regions[0]['name'])->toBe('Chicago');
});

it('can search regions by zipcode', function () {
    $response = getJson($this->baseUrl.'/api/location/search?query=60601');

    $response->assertSuccessful();
    $regions = $response->json('regions');
    expect($regions)->toHaveCount(1);
    expect($regions[0]['name'])->toBe('Chicago');
});

it('returns empty array for non-matching search', function () {
    $response = getJson($this->baseUrl.'/api/location/search?query=NonExistentCity');

    $response->assertSuccessful();
    $response->assertJson([
        'success' => true,
        'regions' => [],
    ]);
});

it('validates search query parameter', function () {
    $response = getJson($this->baseUrl.'/api/location/search');

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['query']);
});

it('can detect location from browser coordinates', function () {
    $response = postJson($this->baseUrl.'/api/location/detect-browser', [
        'latitude' => 41.88,
        'longitude' => -87.63,
    ]);

    $response->assertSuccessful();
    $response->assertJson([
        'success' => true,
        'region' => [
            'name' => 'Chicago',
        ],
    ]);
});

it('validates browser coordinates', function () {
    $response = postJson($this->baseUrl.'/api/location/detect-browser', [
        'latitude' => 'invalid',
        'longitude' => 'invalid',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['latitude', 'longitude']);
});

it('can clear location preference', function () {
    session(['user_location_region_id' => $this->region->id]);
    session(['user_location_confirmed' => true]);

    $response = postJson($this->baseUrl.'/api/location/clear');

    $response->assertSuccessful();
    $response->assertJson([
        'success' => true,
    ]);

    expect(session('user_location_region_id'))->toBeNull();
    expect(session('user_location_confirmed'))->toBeNull();
});

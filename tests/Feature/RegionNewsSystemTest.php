<?php

declare(strict_types=1);

use App\Models\News;
use App\Models\Region;
use App\Models\RegionZipcode;
use App\Models\User;

test('regions can be created with proper attributes', function () {
    $region = Region::factory()->create([
        'name' => 'Chicago',
        'slug' => 'chicago',
        'type' => 'city',
        'is_active' => true,
    ]);

    expect($region)
        ->name->toBe('Chicago')
        ->slug->toBe('chicago')
        ->type->toBe('city')
        ->is_active->toBeTrue();
});

test('regions can have hierarchical relationships', function () {
    $state = Region::factory()->stateRegion()->create(['name' => 'Illinois']);
    $county = Region::factory()->county()->create([
        'name' => 'Cook County',
        'parent_id' => $state->id,
    ]);
    $city = Region::factory()->city()->create([
        'name' => 'Chicago',
        'parent_id' => $county->id,
    ]);

    expect($city->parent->id)->toBe($county->id);
    expect($county->parent->id)->toBe($state->id);
    expect($county->children)->toHaveCount(1);
    expect($county->children->first()->id)->toBe($city->id);
});

test('regions can have zipcodes associated', function () {
    $region = Region::factory()->create(['name' => 'Chicago']);

    RegionZipcode::factory()->create([
        'region_id' => $region->id,
        'zipcode' => '60601',
        'is_primary' => true,
    ]);

    RegionZipcode::factory()->create([
        'region_id' => $region->id,
        'zipcode' => '60602',
        'is_primary' => false,
    ]);

    expect($region->zipcodes)->toHaveCount(2);
    expect($region->hasZipcode('60601'))->toBeTrue();
    expect($region->hasZipcode('60602'))->toBeTrue();
    expect($region->hasZipcode('99999'))->toBeFalse();
});

test('one zipcode can belong to multiple regions', function () {
    $state = Region::factory()->stateRegion()->create(['name' => 'Illinois']);
    $county = Region::factory()->county()->create(['name' => 'Cook County']);
    $city = Region::factory()->city()->create(['name' => 'Chicago']);

    RegionZipcode::factory()->create([
        'region_id' => $state->id,
        'zipcode' => '60601',
    ]);

    RegionZipcode::factory()->create([
        'region_id' => $county->id,
        'zipcode' => '60601',
    ]);

    RegionZipcode::factory()->create([
        'region_id' => $city->id,
        'zipcode' => '60601',
        'is_primary' => true,
    ]);

    $regions = Region::forZipcode('60601')->get();

    expect($regions)->toHaveCount(3);
});

test('can find regions by zipcode', function () {
    $chicago = Region::factory()->create(['name' => 'Chicago', 'type' => 'city']);
    $naperville = Region::factory()->create(['name' => 'Naperville', 'type' => 'city']);

    RegionZipcode::factory()->create(['region_id' => $chicago->id, 'zipcode' => '60601']);
    RegionZipcode::factory()->create(['region_id' => $naperville->id, 'zipcode' => '60540']);

    $regionsForChicago = Region::forZipcode('60601')->get();
    $regionsForNaperville = Region::forZipcode('60540')->get();

    expect($regionsForChicago)->toHaveCount(1);
    expect($regionsForChicago->first()->name)->toBe('Chicago');

    expect($regionsForNaperville)->toHaveCount(1);
    expect($regionsForNaperville->first()->name)->toBe('Naperville');
});

test('news can be created with proper attributes', function () {
    $user = User::factory()->create();

    $news = News::factory()->create([
        'title' => 'Breaking News',
        'slug' => 'breaking-news',
        'content' => 'This is the content',
        'status' => 'published',
        'author_id' => $user->id,
    ]);

    expect($news)
        ->title->toBe('Breaking News')
        ->slug->toBe('breaking-news')
        ->status->toBe('published')
        ->author_id->toBe($user->id);
});

test('news can be assigned to multiple regions', function () {
    $chicago = Region::factory()->create(['name' => 'Chicago']);
    $naperville = Region::factory()->create(['name' => 'Naperville']);

    $news = News::factory()->published()->create(['title' => 'Local Event']);

    $news->regions()->attach([$chicago->id, $naperville->id]);

    expect($news->regions)->toHaveCount(2);
    expect($news->regions->pluck('name')->toArray())->toContain('Chicago', 'Naperville');
});

test('can query news by zipcode', function () {
    $chicago = Region::factory()->create(['name' => 'Chicago']);
    RegionZipcode::factory()->create(['region_id' => $chicago->id, 'zipcode' => '60601']);

    $naperville = Region::factory()->create(['name' => 'Naperville']);
    RegionZipcode::factory()->create(['region_id' => $naperville->id, 'zipcode' => '60540']);

    $chicagoNews = News::factory()->published()->create(['title' => 'Chicago News']);
    $chicagoNews->regions()->attach($chicago->id);

    $napervilleNews = News::factory()->published()->create(['title' => 'Naperville News']);
    $napervilleNews->regions()->attach($naperville->id);

    $bothNews = News::factory()->published()->create(['title' => 'Regional News']);
    $bothNews->regions()->attach([$chicago->id, $naperville->id]);

    $newsForChicago = News::published()->forZipcode('60601')->get();
    $newsForNaperville = News::published()->forZipcode('60540')->get();

    expect($newsForChicago)->toHaveCount(2);
    expect($newsForChicago->pluck('title')->toArray())->toContain('Chicago News', 'Regional News');

    expect($newsForNaperville)->toHaveCount(2);
    expect($newsForNaperville->pluck('title')->toArray())->toContain('Naperville News', 'Regional News');
});

test('can query news by region', function () {
    $chicago = Region::factory()->create(['name' => 'Chicago']);
    $news = News::factory()->published()->create(['title' => 'Chicago News']);
    $news->regions()->attach($chicago->id);

    $newsForChicago = News::published()->forRegion($chicago->id)->get();

    expect($newsForChicago)->toHaveCount(1);
    expect($newsForChicago->first()->title)->toBe('Chicago News');
});

test('draft news is not returned in published scope', function () {
    $region = Region::factory()->create();
    RegionZipcode::factory()->create(['region_id' => $region->id, 'zipcode' => '60601']);

    $publishedNews = News::factory()->published()->create();
    $publishedNews->regions()->attach($region->id);

    $draftNews = News::factory()->draft()->create();
    $draftNews->regions()->attach($region->id);

    $newsForZipcode = News::published()->forZipcode('60601')->get();

    expect($newsForZipcode)->toHaveCount(1);
    expect($newsForZipcode->first()->status)->toBe('published');
});

test('can get applicable zipcodes for news', function () {
    $chicago = Region::factory()->create(['name' => 'Chicago']);
    RegionZipcode::factory()->create(['region_id' => $chicago->id, 'zipcode' => '60601']);
    RegionZipcode::factory()->create(['region_id' => $chicago->id, 'zipcode' => '60602']);

    $naperville = Region::factory()->create(['name' => 'Naperville']);
    RegionZipcode::factory()->create(['region_id' => $naperville->id, 'zipcode' => '60540']);

    $news = News::factory()->published()->create();
    $news->regions()->attach([$chicago->id, $naperville->id]);

    $zipcodes = $news->getApplicableZipcodes();

    expect($zipcodes)->toHaveCount(3);
    expect($zipcodes)->toContain('60601', '60602', '60540');
});

test('region scopes work correctly', function () {
    $activeRegion = Region::factory()->active()->create(['name' => 'Active Region 1', 'type' => 'neighborhood']);
    $inactiveRegion = Region::factory()->inactive()->create(['name' => 'Inactive Region 1', 'type' => 'neighborhood']);
    $stateRegion = Region::factory()->stateRegion()->create(['name' => 'Texas']);
    $cityRegion = Region::factory()->city()->create(['name' => 'Dallas']);

    expect(Region::active()->whereIn('id', [$activeRegion->id, $inactiveRegion->id, $stateRegion->id, $cityRegion->id])->count())->toBe(3);
    expect(Region::ofType('state')->whereIn('id', [$activeRegion->id, $inactiveRegion->id, $stateRegion->id, $cityRegion->id])->count())->toBe(1);
    expect(Region::ofType('city')->whereIn('id', [$activeRegion->id, $inactiveRegion->id, $stateRegion->id, $cityRegion->id])->count())->toBe(1);
    expect(Region::topLevel()->whereIn('id', [$activeRegion->id, $inactiveRegion->id, $stateRegion->id, $cityRegion->id])->count())->toBe(4);
});

test('news scopes work correctly', function () {
    News::factory()->published()->create();
    News::factory()->published()->create();
    News::factory()->draft()->create();
    News::factory()->archived()->create();

    expect(News::published()->count())->toBe(2);
    expect(News::draft()->count())->toBe(1);
    expect(News::archived()->count())->toBe(1);
});

<?php

declare(strict_types=1);

use App\Filament\Pages\ImportBusinesses;
use App\Models\Business;
use App\Models\Region;
use App\Models\User;
use Livewire\Livewire;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    config(['app.admin_emails' => 'admin@example.com']);
    $this->admin = User::factory()->create(['email' => 'admin@example.com']);
    $this->actingAs($this->admin);
});

describe('ImportBusinesses Page Access', function () {
    it('can render import businesses page', function () {
        Livewire::test(ImportBusinesses::class)
            ->assertSuccessful();
    });

    it('has correct navigation settings', function () {
        expect(ImportBusinesses::getNavigationGroup())->toBe('Day News')
            ->and(ImportBusinesses::getNavigationSort())->toBe(5);
    });
});

describe('ImportBusinesses Import Logic', function () {
    it('imports businesses and regions from parsed data', function () {
        $regionId = fake()->uuid();

        $component = Livewire::test(ImportBusinesses::class);

        // Simulate parsed data (normally set by parseJsonFile)
        $component->set('parsedData', [
            'exported_at' => now()->toIso8601String(),
            'regions' => [
                [
                    'id' => $regionId,
                    'name' => 'Test City',
                    'slug' => 'test-city',
                    'type' => 'city',
                    'parent_id' => null,
                    'description' => null,
                    'is_active' => true,
                    'display_order' => 0,
                    'metadata' => null,
                    'latitude' => '29.6516000',
                    'longitude' => '-82.3248000',
                ],
            ],
            'businesses' => [
                [
                    'id' => fake()->uuid(),
                    'google_place_id' => 'ChIJtest123',
                    'name' => 'Test Business',
                    'slug' => 'test-business',
                    'status' => 'active',
                    'city' => 'Test City',
                    'state' => 'FL',
                    'region_ids' => [$regionId],
                ],
            ],
        ]);

        $component->set('data.preserve_uuids', false)
            ->set('data.skip_duplicates', true)
            ->call('startImport');

        $this->assertDatabaseHas('regions', [
            'name' => 'Test City',
            'slug' => 'test-city',
            'type' => 'city',
        ]);

        $this->assertDatabaseHas('businesses', [
            'name' => 'Test Business',
            'google_place_id' => 'ChIJtest123',
            'workspace_id' => null,
        ]);

        // Check pivot
        $business = Business::where('name', 'Test Business')->first();
        $region = Region::where('slug', 'test-city')->first();
        expect($business->regions->pluck('id')->toArray())->toContain($region->id);
    });

    it('skips duplicate businesses by google_place_id', function () {
        Business::factory()->create([
            'google_place_id' => 'ChIJexisting',
            'name' => 'Existing Business',
        ]);

        $component = Livewire::test(ImportBusinesses::class);

        $component->set('parsedData', [
            'exported_at' => now()->toIso8601String(),
            'regions' => [],
            'businesses' => [
                [
                    'id' => fake()->uuid(),
                    'google_place_id' => 'ChIJexisting',
                    'name' => 'Duplicate Business',
                    'slug' => 'duplicate-business',
                    'status' => 'active',
                    'region_ids' => [],
                ],
                [
                    'id' => fake()->uuid(),
                    'google_place_id' => 'ChIJnew123',
                    'name' => 'New Business',
                    'slug' => 'new-business',
                    'status' => 'active',
                    'region_ids' => [],
                ],
            ],
        ]);

        $component->set('data.skip_duplicates', true)
            ->call('startImport');

        $this->assertDatabaseMissing('businesses', ['name' => 'Duplicate Business']);
        $this->assertDatabaseHas('businesses', ['name' => 'New Business']);
    });

    it('preserves UUIDs when option is enabled', function () {
        $businessId = fake()->uuid();
        $regionId = fake()->uuid();

        $component = Livewire::test(ImportBusinesses::class);

        $component->set('parsedData', [
            'exported_at' => now()->toIso8601String(),
            'regions' => [
                [
                    'id' => $regionId,
                    'name' => 'UUID Region',
                    'slug' => 'uuid-region',
                    'type' => 'city',
                    'parent_id' => null,
                    'is_active' => true,
                    'display_order' => 0,
                    'metadata' => null,
                    'latitude' => null,
                    'longitude' => null,
                ],
            ],
            'businesses' => [
                [
                    'id' => $businessId,
                    'google_place_id' => 'ChIJuuid123',
                    'name' => 'UUID Business',
                    'slug' => 'uuid-business',
                    'status' => 'active',
                    'region_ids' => [$regionId],
                ],
            ],
        ]);

        $component->set('data.preserve_uuids', true)
            ->set('data.skip_duplicates', true)
            ->call('startImport');

        $this->assertDatabaseHas('businesses', [
            'id' => $businessId,
            'name' => 'UUID Business',
        ]);

        $this->assertDatabaseHas('regions', [
            'id' => $regionId,
            'name' => 'UUID Region',
        ]);
    });

    it('matches existing regions by slug instead of creating duplicates', function () {
        $existingRegion = Region::factory()->create([
            'name' => 'Existing Region',
            'slug' => 'existing-region',
            'type' => 'city',
        ]);

        $component = Livewire::test(ImportBusinesses::class);

        $exportedRegionId = fake()->uuid();

        $component->set('parsedData', [
            'exported_at' => now()->toIso8601String(),
            'regions' => [
                [
                    'id' => $exportedRegionId,
                    'name' => 'Existing Region',
                    'slug' => 'existing-region',
                    'type' => 'city',
                    'parent_id' => null,
                    'is_active' => true,
                    'display_order' => 0,
                    'metadata' => null,
                    'latitude' => null,
                    'longitude' => null,
                ],
            ],
            'businesses' => [
                [
                    'id' => fake()->uuid(),
                    'google_place_id' => 'ChIJmatch123',
                    'name' => 'Matched Region Business',
                    'slug' => 'matched-region-business',
                    'status' => 'active',
                    'region_ids' => [$exportedRegionId],
                ],
            ],
        ]);

        $component->set('data.preserve_uuids', false)
            ->set('data.skip_duplicates', true)
            ->call('startImport');

        // Should not create duplicate region
        expect(Region::where('slug', 'existing-region')->count())->toBe(1);

        // Business should be linked to the existing region
        $business = Business::where('name', 'Matched Region Business')->first();
        expect($business->regions->pluck('id')->toArray())->toContain($existingRegion->id);
    });

    it('maintains region hierarchy on import', function () {
        $stateId = fake()->uuid();
        $countyId = fake()->uuid();
        $cityId = fake()->uuid();

        $component = Livewire::test(ImportBusinesses::class);

        $component->set('parsedData', [
            'exported_at' => now()->toIso8601String(),
            'regions' => [
                [
                    'id' => $stateId,
                    'name' => 'Florida',
                    'slug' => 'florida',
                    'type' => 'state',
                    'parent_id' => null,
                    'is_active' => true,
                    'display_order' => 0,
                    'metadata' => null,
                    'latitude' => null,
                    'longitude' => null,
                ],
                [
                    'id' => $countyId,
                    'name' => 'Alachua County',
                    'slug' => 'alachua-county',
                    'type' => 'county',
                    'parent_id' => $stateId,
                    'is_active' => true,
                    'display_order' => 0,
                    'metadata' => null,
                    'latitude' => null,
                    'longitude' => null,
                ],
                [
                    'id' => $cityId,
                    'name' => 'Gainesville',
                    'slug' => 'gainesville',
                    'type' => 'city',
                    'parent_id' => $countyId,
                    'is_active' => true,
                    'display_order' => 0,
                    'metadata' => null,
                    'latitude' => null,
                    'longitude' => null,
                ],
            ],
            'businesses' => [
                [
                    'id' => fake()->uuid(),
                    'google_place_id' => 'ChIJhierarchy123',
                    'name' => 'Hierarchy Business',
                    'slug' => 'hierarchy-business',
                    'status' => 'active',
                    'region_ids' => [$cityId],
                ],
            ],
        ]);

        $component->set('data.preserve_uuids', true)
            ->set('data.skip_duplicates', true)
            ->call('startImport');

        $state = Region::where('slug', 'florida')->first();
        $county = Region::where('slug', 'alachua-county')->first();
        $city = Region::where('slug', 'gainesville')->first();

        expect($state)->not->toBeNull()
            ->and($county->parent_id)->toBe($state->id)
            ->and($city->parent_id)->toBe($county->id);
    });

    it('sets workspace_id to null for all imported businesses', function () {
        $component = Livewire::test(ImportBusinesses::class);

        $component->set('parsedData', [
            'exported_at' => now()->toIso8601String(),
            'regions' => [],
            'businesses' => [
                [
                    'id' => fake()->uuid(),
                    'google_place_id' => 'ChIJnullws123',
                    'name' => 'No Workspace Business',
                    'slug' => 'no-workspace-business',
                    'status' => 'active',
                    'region_ids' => [],
                ],
            ],
        ]);

        $component->set('data.preserve_uuids', false)
            ->call('startImport');

        $business = Business::where('name', 'No Workspace Business')->first();
        expect($business->workspace_id)->toBeNull();
    });
});

<?php

declare(strict_types=1);

use App\Filament\Pages\ImportRegions;
use App\Jobs\Regions\GeocodeRegionJob;
use App\Jobs\Regions\ProcessRegionImportJob;
use App\Models\Region;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Livewire\Livewire;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    config(['app.admin_emails' => 'admin@example.com']);
    $this->admin = User::factory()->create(['email' => 'admin@example.com']);
    $this->actingAs($this->admin);
});

describe('ImportRegions Page Access', function () {
    it('can render import regions page', function () {
        Livewire::test(ImportRegions::class)
            ->assertSuccessful();
    });

    it('has correct navigation settings', function () {
        expect(ImportRegions::getNavigationGroup())->toBe('Day News')
            ->and(ImportRegions::getNavigationSort())->toBe(3);
    });
});

describe('ProcessRegionImportJob', function () {
    it('creates state region from CSV row', function () {
        $rows = [
            [
                'Day' => '1',
                'Date' => '2025-12-01',
                'Community' => 'Gainesville',
                'City' => 'Gainesville',
                'County' => 'Alachua',
                'State' => 'FL',
                'Population' => '150647',
                'Est_SMBs' => '16026',
                'Type' => 'major',
                'Notes' => 'Primary launch',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => false,
                'mark_active' => true,
                'store_metadata' => true,
                'parent_region_id' => null,
            ],
            userId: $this->admin->id
        );
        $job->handle();

        // Check state was created
        $this->assertDatabaseHas('regions', [
            'name' => 'Florida',
            'slug' => 'florida',
            'type' => 'state',
            'is_active' => true,
        ]);

        // Check county was created
        $this->assertDatabaseHas('regions', [
            'name' => 'Alachua County',
            'type' => 'county',
            'is_active' => true,
        ]);

        // Check city was created
        $this->assertDatabaseHas('regions', [
            'name' => 'Gainesville',
            'type' => 'city',
            'is_active' => true,
        ]);
    });

    it('creates hierarchy correctly', function () {
        $rows = [
            [
                'Community' => 'Miami',
                'City' => 'Miami',
                'County' => 'Miami-Dade',
                'State' => 'FL',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => false,
                'mark_active' => true,
                'store_metadata' => false,
            ],
            userId: null
        );
        $job->handle();

        $state = Region::where('type', 'state')->first();
        $county = Region::where('type', 'county')->first();
        $city = Region::where('type', 'city')->first();

        expect($state)->not->toBeNull()
            ->and($county->parent_id)->toBe($state->id)
            ->and($city->parent_id)->toBe($county->id);
    });

    it('creates neighborhood when community differs from city', function () {
        $rows = [
            [
                'Community' => 'Downtown',
                'City' => 'Miami',
                'County' => 'Miami-Dade',
                'State' => 'FL',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => false,
                'mark_active' => true,
                'store_metadata' => false,
            ],
            userId: null
        );
        $job->handle();

        $this->assertDatabaseHas('regions', [
            'name' => 'Downtown',
            'type' => 'neighborhood',
        ]);

        $neighborhood = Region::where('name', 'Downtown')->first();
        $city = Region::where('name', 'Miami')->first();

        expect($neighborhood->parent_id)->toBe($city->id);
    });

    it('stores metadata when enabled', function () {
        $rows = [
            [
                'Community' => 'Tampa',
                'City' => 'Tampa',
                'County' => 'Hillsborough',
                'State' => 'FL',
                'Population' => '384959',
                'Est_SMBs' => '40000',
                'Type' => 'major',
                'Notes' => 'Test note',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => false,
                'mark_active' => true,
                'store_metadata' => true,
            ],
            userId: null
        );
        $job->handle();

        $city = Region::where('name', 'Tampa')->where('type', 'city')->first();

        expect($city->metadata)->not->toBeNull()
            ->and($city->metadata['csv_data']['population'])->toBe(384959)
            ->and($city->metadata['csv_data']['est_smbs'])->toBe(40000)
            ->and($city->metadata['csv_data']['type'])->toBe('major')
            ->and($city->metadata['csv_data']['notes'])->toBe('Test note');
    });

    it('skips rows with missing required fields', function () {
        $rows = [
            [
                'Community' => 'Test',
                'City' => 'Test',
                'County' => '',  // Missing county
                'State' => 'FL',
            ],
            [
                'Community' => 'Valid',
                'City' => 'Valid',
                'County' => 'Valid County',
                'State' => 'FL',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => false,
                'mark_active' => true,
                'store_metadata' => false,
            ],
            userId: null
        );
        $job->handle();

        // Only the valid row should create regions
        $this->assertDatabaseMissing('regions', ['name' => 'Test']);
        $this->assertDatabaseHas('regions', ['name' => 'Valid']);
    });

    it('does not create duplicate regions', function () {
        $rows = [
            [
                'Community' => 'Orlando',
                'City' => 'Orlando',
                'County' => 'Orange',
                'State' => 'FL',
            ],
            [
                'Community' => 'Orlando',
                'City' => 'Orlando',
                'County' => 'Orange',
                'State' => 'FL',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => false,
                'mark_active' => true,
                'store_metadata' => false,
            ],
            userId: null
        );
        $job->handle();

        // Should only have one of each
        expect(Region::where('name', 'Florida')->count())->toBe(1)
            ->and(Region::where('name', 'Orange County')->count())->toBe(1)
            ->and(Region::where('name', 'Orlando')->count())->toBe(1);
    });

    it('dispatches geocoding jobs when enabled', function () {
        Queue::fake();

        $rows = [
            [
                'Community' => 'Jacksonville',
                'City' => 'Jacksonville',
                'County' => 'Duval',
                'State' => 'FL',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => true,
                'mark_active' => true,
                'store_metadata' => false,
            ],
            userId: null
        );
        $job->handle();

        Queue::assertPushed(GeocodeRegionJob::class);
    });

    it('does not dispatch geocoding jobs when disabled', function () {
        Queue::fake();

        $rows = [
            [
                'Community' => 'Pensacola',
                'City' => 'Pensacola',
                'County' => 'Escambia',
                'State' => 'FL',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => false,
                'mark_active' => true,
                'store_metadata' => false,
            ],
            userId: null
        );
        $job->handle();

        Queue::assertNotPushed(GeocodeRegionJob::class);
    });

    it('converts state abbreviations to full names', function () {
        $rows = [
            [
                'Community' => 'Austin',
                'City' => 'Austin',
                'County' => 'Travis',
                'State' => 'TX',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => false,
                'mark_active' => true,
                'store_metadata' => false,
            ],
            userId: null
        );
        $job->handle();

        $this->assertDatabaseHas('regions', [
            'name' => 'Texas',
            'type' => 'state',
        ]);
    });

    it('nests under parent region when specified', function () {
        $parentRegion = Region::factory()->create([
            'name' => 'USA',
            'type' => 'state', // Using valid type
        ]);

        $rows = [
            [
                'Community' => 'Seattle',
                'City' => 'Seattle',
                'County' => 'King',
                'State' => 'WA',
            ],
        ];

        $job = new ProcessRegionImportJob(
            rows: $rows,
            options: [
                'enable_geocoding' => false,
                'mark_active' => true,
                'store_metadata' => false,
                'parent_region_id' => $parentRegion->id,
            ],
            userId: null
        );
        $job->handle();

        $state = Region::where('name', 'Washington')->first();
        expect($state->parent_id)->toBe($parentRegion->id);
    });
});

describe('GeocodeRegionJob', function () {
    it('skips regions that already have coordinates', function () {
        $region = Region::factory()->create([
            'latitude' => 29.6516,
            'longitude' => -82.3248,
        ]);

        // Job should complete without error and not modify the region
        GeocodeRegionJob::dispatchSync($region);

        $region->refresh();
        expect($region->latitude)->toBe('29.6516000')
            ->and($region->longitude)->toBe('-82.3248000');
    });
});

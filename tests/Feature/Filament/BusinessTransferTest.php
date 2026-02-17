<?php

declare(strict_types=1);

use App\Filament\Pages\BusinessTransfer;
use App\Models\Business;
use App\Models\Region;
use App\Models\User;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    config(['app.admin_emails' => 'admin@example.com']);
    $this->admin = User::factory()->create(['email' => 'admin@example.com']);
    $this->actingAs($this->admin);
});

/**
 * Extract a tar.gz export response and return parsed data.
 *
 * @return array{metadata: array, regions: array, businesses: array}
 */
function extractExport(Symfony\Component\HttpFoundation\BinaryFileResponse $response): array
{
    $tarGzPath = $response->getFile()->getPathname();
    $tempDir = sys_get_temp_dir().'/test-extract-'.uniqid();
    mkdir($tempDir, 0755, true);
    exec(sprintf('tar -xzf %s -C %s', escapeshellarg($tarGzPath), escapeshellarg($tempDir)));

    $metadata = json_decode(file_get_contents("{$tempDir}/metadata.json"), true) ?? [];
    $regions = json_decode(file_get_contents("{$tempDir}/regions.json"), true) ?? [];

    $businesses = [];
    $chunkFiles = glob("{$tempDir}/businesses/chunk-*.json") ?: [];
    sort($chunkFiles);

    foreach ($chunkFiles as $f) {
        $businesses = array_merge($businesses, json_decode(file_get_contents($f), true) ?? []);
    }

    File::deleteDirectory($tempDir);
    @unlink($tarGzPath);

    return compact('metadata', 'regions', 'businesses');
}

/**
 * Create a tar.gz archive on the faked local disk from the given data.
 */
function createTestArchive(array $regions, array $businesses): string
{
    $tempDir = sys_get_temp_dir().'/test-archive-'.uniqid();
    mkdir($tempDir.'/businesses', 0755, true);

    file_put_contents("{$tempDir}/metadata.json", json_encode([
        'exported_at' => now()->toIso8601String(),
    ]));
    file_put_contents("{$tempDir}/regions.json", json_encode($regions));

    if (! empty($businesses)) {
        file_put_contents("{$tempDir}/businesses/chunk-0001.json", json_encode($businesses));
    }

    $filePath = 'tmp/test-import-'.uniqid().'.tar.gz';
    $diskPath = Storage::disk('local')->path($filePath);
    File::ensureDirectoryExists(dirname($diskPath));

    exec(sprintf('tar -czf %s -C %s .', escapeshellarg($diskPath), escapeshellarg($tempDir)));
    File::deleteDirectory($tempDir);

    return $filePath;
}

describe('Page Access', function () {
    it('can render business transfer page', function () {
        Livewire::test(BusinessTransfer::class)
            ->assertSuccessful();
    });

    it('has correct navigation settings', function () {
        expect(BusinessTransfer::getNavigationGroup())->toBe('Day News')
            ->and(BusinessTransfer::getNavigationSort())->toBe(4);
    });
});

describe('Export Preview', function () {
    it('shows preview count after clicking preview', function () {
        Business::factory()->count(3)->create(['status' => 'active']);

        Livewire::test(BusinessTransfer::class)
            ->call('updatePreview')
            ->assertSet('previewCount', 3);
    });

    it('filters by region', function () {
        $region = Region::factory()->active()->create();
        $inRegion = Business::factory()->create(['status' => 'active']);
        $inRegion->regions()->attach($region);

        Business::factory()->create(['status' => 'active']);

        Livewire::test(BusinessTransfer::class)
            ->set('data.region_id', $region->id)
            ->call('updatePreview')
            ->assertSet('previewCount', 1);
    });

    it('filters by active status', function () {
        Business::factory()->count(2)->create(['status' => 'active']);
        Business::factory()->create(['status' => 'inactive']);

        Livewire::test(BusinessTransfer::class)
            ->set('data.status', 'active')
            ->call('updatePreview')
            ->assertSet('previewCount', 2);
    });

    it('filters by inactive status', function () {
        Business::factory()->count(2)->create(['status' => 'active']);
        Business::factory()->create(['status' => 'inactive']);

        Livewire::test(BusinessTransfer::class)
            ->set('data.status', 'inactive')
            ->call('updatePreview')
            ->assertSet('previewCount', 1);
    });
});

describe('Export Archive', function () {
    it('exports valid tar.gz archive', function () {
        $region = Region::factory()->active()->create();
        $business = Business::factory()->create(['status' => 'active']);
        $business->regions()->attach($region);

        $component = Livewire::test(BusinessTransfer::class);
        $response = $component->instance()->export();

        $data = extractExport($response);

        expect($data['metadata'])->toHaveKey('exported_at')
            ->and($data['regions'])->toHaveCount(1)
            ->and($data['businesses'])->toHaveCount(1)
            ->and($data['businesses'][0]['name'])->toBe($business->name);
    });

    it('excludes workspace_id from exported businesses', function () {
        Business::factory()->create(['status' => 'active']);

        $component = Livewire::test(BusinessTransfer::class);
        $data = extractExport($component->instance()->export());

        expect($data['businesses'][0])->not->toHaveKey('workspace_id');
    });

    it('includes region_ids in exported businesses', function () {
        $region1 = Region::factory()->active()->create();
        $region2 = Region::factory()->active()->create();
        $business = Business::factory()->create(['status' => 'active']);
        $business->regions()->attach([$region1->id, $region2->id]);

        $component = Livewire::test(BusinessTransfer::class);
        $data = extractExport($component->instance()->export());

        expect($data['businesses'][0]['region_ids'])->toHaveCount(2)
            ->and($data['businesses'][0]['region_ids'])->toContain($region1->id)
            ->and($data['businesses'][0]['region_ids'])->toContain($region2->id);
    });

    it('exports regions with hierarchy ordering', function () {
        $state = Region::factory()->stateRegion()->active()->create();
        $county = Region::factory()->county()->active()->create(['parent_id' => $state->id]);
        $business = Business::factory()->create(['status' => 'active']);
        $business->regions()->attach([$state->id, $county->id]);

        $component = Livewire::test(BusinessTransfer::class);
        $data = extractExport($component->instance()->export());

        expect($data['regions'])->toHaveCount(2);

        $regionTypes = array_column($data['regions'], 'type');
        $stateIdx = array_search('state', $regionTypes);
        $countyIdx = array_search('county', $regionTypes);
        expect($stateIdx)->toBeLessThan($countyIdx);
    });
});

describe('Import', function () {
    it('imports businesses and regions from archive', function () {
        $regionId = fake()->uuid();
        $businessId = fake()->uuid();

        Storage::fake('local');
        $filePath = createTestArchive(
            regions: [
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
            businesses: [
                [
                    'id' => $businessId,
                    'google_place_id' => 'ChIJtest123',
                    'name' => 'Test Business',
                    'slug' => 'test-business',
                    'status' => 'active',
                    'city' => 'Test City',
                    'state' => 'FL',
                    'region_ids' => [$regionId],
                ],
            ],
        );

        Livewire::test(BusinessTransfer::class)
            ->set('data.import_file', $filePath)
            ->call('parseArchive')
            ->assertSet('importSummary.total_businesses', 1)
            ->assertSet('importSummary.total_regions', 1)
            ->set('data.preserve_uuids', false)
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

        $business = Business::where('name', 'Test Business')->first();
        $region = Region::where('slug', 'test-city')->first();
        expect($business->regions->pluck('id')->toArray())->toContain($region->id);
    });

    it('skips duplicate businesses by google_place_id', function () {
        Business::factory()->create([
            'google_place_id' => 'ChIJexisting',
            'name' => 'Existing Business',
        ]);

        Storage::fake('local');
        $filePath = createTestArchive(
            regions: [],
            businesses: [
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
        );

        Livewire::test(BusinessTransfer::class)
            ->set('data.import_file', $filePath)
            ->set('data.skip_duplicates', true)
            ->call('startImport');

        $this->assertDatabaseMissing('businesses', ['name' => 'Duplicate Business']);
        $this->assertDatabaseHas('businesses', ['name' => 'New Business']);
    });

    it('preserves UUIDs when option is enabled', function () {
        $businessId = fake()->uuid();
        $regionId = fake()->uuid();

        Storage::fake('local');
        $filePath = createTestArchive(
            regions: [
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
            businesses: [
                [
                    'id' => $businessId,
                    'google_place_id' => 'ChIJuuid123',
                    'name' => 'UUID Business',
                    'slug' => 'uuid-business',
                    'status' => 'active',
                    'region_ids' => [$regionId],
                ],
            ],
        );

        Livewire::test(BusinessTransfer::class)
            ->set('data.import_file', $filePath)
            ->set('data.preserve_uuids', true)
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

        $exportedRegionId = fake()->uuid();

        Storage::fake('local');
        $filePath = createTestArchive(
            regions: [
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
            businesses: [
                [
                    'id' => fake()->uuid(),
                    'google_place_id' => 'ChIJmatch123',
                    'name' => 'Matched Region Business',
                    'slug' => 'matched-region-business',
                    'status' => 'active',
                    'region_ids' => [$exportedRegionId],
                ],
            ],
        );

        Livewire::test(BusinessTransfer::class)
            ->set('data.import_file', $filePath)
            ->set('data.preserve_uuids', false)
            ->set('data.skip_duplicates', true)
            ->call('startImport');

        expect(Region::where('slug', 'existing-region')->count())->toBe(1);

        $business = Business::where('name', 'Matched Region Business')->first();
        expect($business->regions->pluck('id')->toArray())->toContain($existingRegion->id);
    });

    it('maintains region hierarchy on import', function () {
        $stateId = fake()->uuid();
        $countyId = fake()->uuid();
        $cityId = fake()->uuid();

        Storage::fake('local');
        $filePath = createTestArchive(
            regions: [
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
            businesses: [
                [
                    'id' => fake()->uuid(),
                    'google_place_id' => 'ChIJhierarchy123',
                    'name' => 'Hierarchy Business',
                    'slug' => 'hierarchy-business',
                    'status' => 'active',
                    'region_ids' => [$cityId],
                ],
            ],
        );

        Livewire::test(BusinessTransfer::class)
            ->set('data.import_file', $filePath)
            ->set('data.preserve_uuids', true)
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
        Storage::fake('local');
        $filePath = createTestArchive(
            regions: [],
            businesses: [
                [
                    'id' => fake()->uuid(),
                    'google_place_id' => 'ChIJnullws123',
                    'name' => 'No Workspace Business',
                    'slug' => 'no-workspace-business',
                    'status' => 'active',
                    'region_ids' => [],
                ],
            ],
        );

        Livewire::test(BusinessTransfer::class)
            ->set('data.import_file', $filePath)
            ->set('data.preserve_uuids', false)
            ->call('startImport');

        $business = Business::where('name', 'No Workspace Business')->first();
        expect($business->workspace_id)->toBeNull();
    });
});

<?php

declare(strict_types=1);

use App\Filament\Resources\Regions\Pages\CreateRegion;
use App\Filament\Resources\Regions\Pages\EditRegion;
use App\Filament\Resources\Regions\Pages\ListRegions;
use App\Filament\Resources\Regions\RegionResource;
use App\Models\Region;
use App\Models\User;
use Filament\Actions\DeleteAction;
use Livewire\Livewire;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    config(['app.admin_emails' => 'admin@example.com']);
    $this->admin = User::factory()->create(['email' => 'admin@example.com']);
    $this->actingAs($this->admin);
});

describe('RegionResource Navigation', function () {
    it('has correct navigation group', function () {
        expect(RegionResource::getNavigationGroup())->toBe('Day News');
    });

    it('has correct navigation icon', function () {
        expect(RegionResource::getNavigationIcon())->not->toBeNull();
    });

    it('displays navigation badge with active regions count', function () {
        Region::factory()->count(7)->create(['is_active' => true]);
        Region::factory()->count(3)->create(['is_active' => false]);

        expect(RegionResource::getNavigationBadge())->toBe('7');
        expect(RegionResource::getNavigationBadgeColor())->toBe('success');
    });
});

describe('RegionResource List Page', function () {
    it('can render list page', function () {
        Livewire::test(ListRegions::class)
            ->assertSuccessful();
    });

    it('can list regions', function () {
        $regions = Region::factory()->count(3)->create();

        Livewire::test(ListRegions::class)
            ->assertCanSeeTableRecords($regions);
    });

    it('can filter regions by type', function () {
        $cityRegion = Region::factory()->create(['type' => 'city']);
        $stateRegion = Region::factory()->create(['type' => 'state']);

        Livewire::test(ListRegions::class)
            ->filterTable('type', 'city')
            ->assertCanSeeTableRecords([$cityRegion])
            ->assertCanNotSeeTableRecords([$stateRegion]);
    });

    it('can filter regions by active status', function () {
        $activeRegion = Region::factory()->create(['is_active' => true]);
        $inactiveRegion = Region::factory()->create(['is_active' => false]);

        Livewire::test(ListRegions::class)
            ->filterTable('is_active', true)
            ->assertCanSeeTableRecords([$activeRegion])
            ->assertCanNotSeeTableRecords([$inactiveRegion]);
    });

    it('can filter regions by parent', function () {
        $parent = Region::factory()->create();
        $childOfParent = Region::factory()->create(['parent_id' => $parent->id]);
        $otherRegion = Region::factory()->create();

        Livewire::test(ListRegions::class)
            ->filterTable('parent_id', $parent->id)
            ->assertCanSeeTableRecords([$childOfParent])
            ->assertCanNotSeeTableRecords([$otherRegion]);
    });

    it('can sort regions by display order', function () {
        Region::factory()->create(['display_order' => 1]);
        Region::factory()->create(['display_order' => 2]);

        Livewire::test(ListRegions::class)
            ->sortTable('display_order', 'asc')
            ->assertSuccessful();
    });
});

describe('RegionResource Create Page', function () {
    it('can render create page', function () {
        Livewire::test(CreateRegion::class)
            ->assertSuccessful();
    });

    it('can create region', function () {
        $regionData = [
            'name' => 'New York City',
            'slug' => 'new-york-city',
            'type' => 'city',
            'is_active' => true,
            'display_order' => 1,
        ];

        Livewire::test(CreateRegion::class)
            ->fillForm($regionData)
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('regions', [
            'name' => 'New York City',
            'slug' => 'new-york-city',
            'type' => 'city',
        ]);
    });

    it('auto-generates slug from name', function () {
        Livewire::test(CreateRegion::class)
            ->fillForm([
                'name' => 'Los Angeles County',
                'type' => 'county',
            ])
            ->assertFormSet([
                'slug' => 'los-angeles-county',
            ]);
    });

    it('requires name', function () {
        Livewire::test(CreateRegion::class)
            ->fillForm([
                'name' => '',
            ])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required']);
    });

    it('requires unique slug', function () {
        Region::factory()->create(['slug' => 'existing-slug']);

        Livewire::test(CreateRegion::class)
            ->fillForm([
                'name' => 'Test',
                'slug' => 'existing-slug',
            ])
            ->call('create')
            ->assertHasFormErrors(['slug' => 'unique']);
    });

    it('can create region with parent', function () {
        $parent = Region::factory()->create(['type' => 'state']);

        Livewire::test(CreateRegion::class)
            ->fillForm([
                'name' => 'Child Region',
                'slug' => 'child-region',
                'type' => 'city',
                'parent_id' => $parent->id,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('regions', [
            'name' => 'Child Region',
            'parent_id' => $parent->id,
        ]);
    });

    it('can create region with zipcodes', function () {
        Livewire::test(CreateRegion::class)
            ->fillForm([
                'name' => 'Test Region',
                'slug' => 'test-region',
                'type' => 'city',
                'zipcodes' => [
                    ['zipcode' => '12345', 'is_primary' => true],
                    ['zipcode' => '67890', 'is_primary' => false],
                ],
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $region = Region::where('slug', 'test-region')->first();
        expect($region->zipcodes)->toHaveCount(2);
    });
});

describe('RegionResource Edit Page', function () {
    it('can render edit page', function () {
        $region = Region::factory()->create();

        Livewire::test(EditRegion::class, ['record' => $region->id])
            ->assertSuccessful();
    });

    it('can retrieve data', function () {
        $region = Region::factory()->create();

        Livewire::test(EditRegion::class, ['record' => $region->id])
            ->assertFormSet([
                'name' => $region->name,
                'slug' => $region->slug,
                'type' => $region->type,
                'is_active' => $region->is_active,
            ]);
    });

    it('can update region', function () {
        $region = Region::factory()->create();

        Livewire::test(EditRegion::class, ['record' => $region->id])
            ->fillForm([
                'name' => 'Updated Region Name',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        expect($region->fresh()->name)->toBe('Updated Region Name');
    });

    it('can delete region', function () {
        $region = Region::factory()->create();

        Livewire::test(EditRegion::class, ['record' => $region->id])
            ->callAction(DeleteAction::class);

        $this->assertModelMissing($region);
    });

    it('can toggle region active status', function () {
        $region = Region::factory()->create(['is_active' => true]);

        Livewire::test(EditRegion::class, ['record' => $region->id])
            ->fillForm([
                'is_active' => false,
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        expect($region->fresh()->is_active)->toBeFalse();
    });

    it('can add zipcodes to existing region', function () {
        $region = Region::factory()->create();

        Livewire::test(EditRegion::class, ['record' => $region->id])
            ->fillForm([
                'zipcodes' => [
                    ['zipcode' => '11111', 'is_primary' => true],
                    ['zipcode' => '22222', 'is_primary' => false],
                ],
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        expect($region->fresh()->zipcodes)->toHaveCount(2);
    });
});

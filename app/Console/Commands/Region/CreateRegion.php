<?php

declare(strict_types=1);

namespace App\Console\Commands\Region;

use App\Models\Region;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\select;
use function Laravel\Prompts\text;

final class CreateRegion extends Command
{
    protected $signature = 'region:create
                           {--name= : The name of the region}
                           {--slug= : The URL-friendly slug (auto-generated if not provided)}
                           {--type= : The region type (state, county, city, neighborhood)}
                           {--parent= : The parent region ID (optional)}
                           {--description= : Description of the region (optional)}
                           {--latitude= : Latitude coordinate (optional)}
                           {--longitude= : Longitude coordinate (optional)}
                           {--inactive : Create the region as inactive}';

    protected $description = 'Create a new region';

    public function handle(): int
    {
        $this->info('Creating a new region...');
        $this->newLine();

        // Get name
        $name = $this->option('name') ?? text(
            label: 'Region Name',
            placeholder: 'e.g., Los Angeles',
            required: true
        );

        // Get type
        $type = $this->option('type') ?? select(
            label: 'Region Type',
            options: [
                'state' => 'State',
                'county' => 'County',
                'city' => 'City',
                'neighborhood' => 'Neighborhood',
            ],
            default: 'city'
        );

        // Generate or get slug
        $slug = $this->option('slug') ?? Str::slug($name);

        // Check if slug already exists
        if (Region::where('slug', $slug)->exists()) {
            $this->error("A region with slug '{$slug}' already exists.");

            $overrideSlug = text(
                label: 'Enter a different slug',
                placeholder: $slug,
                required: true
            );

            $slug = Str::slug($overrideSlug);

            if (Region::where('slug', $slug)->exists()) {
                $this->error("Slug '{$slug}' still exists. Aborting.");

                return self::FAILURE;
            }
        }

        // Get parent region
        $parentId = $this->option('parent');

        if (! $parentId && confirm('Does this region have a parent region?', false)) {
            $parentOptions = Region::query()
                ->orderBy('name')
                ->get()
                ->mapWithKeys(fn ($region) => [$region->id => "{$region->name} ({$region->type})"])
                ->toArray();

            if (empty($parentOptions)) {
                $this->warn('No parent regions available.');
            } else {
                $parentId = select(
                    label: 'Select Parent Region',
                    options: $parentOptions
                );
            }
        }

        if ($parentId && ! Region::find($parentId)) {
            $this->error("Parent region with ID '{$parentId}' not found.");

            return self::FAILURE;
        }

        // Get description
        $description = $this->option('description') ?? text(
            label: 'Description (optional)',
            placeholder: 'Brief description of the region',
            required: false
        );

        // Get coordinates
        $latitude = $this->option('latitude');
        $longitude = $this->option('longitude');

        if (! $latitude && confirm('Add geographic coordinates?', false)) {
            $latitude = text(
                label: 'Latitude',
                placeholder: 'e.g., 34.0522',
                required: false,
                validate: fn ($value) => $value === '' || (is_numeric($value) && $value >= -90 && $value <= 90)
                    ? null
                    : 'Latitude must be between -90 and 90'
            );

            $longitude = text(
                label: 'Longitude',
                placeholder: 'e.g., -118.2437',
                required: false,
                validate: fn ($value) => $value === '' || (is_numeric($value) && $value >= -180 && $value <= 180)
                    ? null
                    : 'Longitude must be between -180 and 180'
            );
        }

        // Determine if active
        $isActive = ! $this->option('inactive');

        // Create the region
        try {
            $region = Region::create([
                'name' => $name,
                'slug' => $slug,
                'type' => $type,
                'parent_id' => $parentId,
                'description' => $description ?: null,
                'is_active' => $isActive,
                'display_order' => 0,
                'metadata' => [],
                'latitude' => $latitude ? (float) $latitude : null,
                'longitude' => $longitude ? (float) $longitude : null,
            ]);

            $this->newLine();
            $this->info('✓ Region created successfully!');
            $this->newLine();

            $this->table(
                ['Field', 'Value'],
                [
                    ['ID', $region->id],
                    ['Name', $region->name],
                    ['Slug', $region->slug],
                    ['Type', $region->type],
                    ['Parent', $parentId ? Region::find($parentId)->name : 'None'],
                    ['Status', $isActive ? 'Active' : 'Inactive'],
                    ['Coordinates', $latitude && $longitude ? "{$latitude}, {$longitude}" : 'Not set'],
                ]
            );

            return self::SUCCESS;
        } catch (Exception $e) {
            $this->error('Failed to create region: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}

<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Region;
use App\Models\RegionZipcode;
use Illuminate\Database\Seeder;

final class RegionZipcodeSeeder extends Seeder
{
    /**
     * Seed region zipcodes.
     */
    public function run(): void
    {
        $regions = Region::where('type', 'city')->get();

        if ($regions->isEmpty()) {
            $this->command->warn('⚠ No city regions found. Run RegionSeeder first.');
            return;
        }

        foreach ($regions as $region) {
            // Create 1-5 zipcodes per city
            $zipcodeCount = rand(1, 5);
            for ($i = 0; $i < $zipcodeCount; $i++) {
                RegionZipcode::firstOrCreate(
                    [
                        'region_id' => $region->id,
                        'zipcode' => fake()->postcode(),
                    ],
                    RegionZipcode::factory()->make([
                        'region_id' => $region->id,
                        'zipcode' => fake()->postcode(),
                        'is_primary' => $i === 0,
                    ])->toArray()
                );
            }
        }

        $totalZipcodes = RegionZipcode::count();
        $this->command->info("✓ Total region zipcodes: {$totalZipcodes}");
    }
}



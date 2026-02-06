<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsFetchFrequency;
use App\Models\Region;
use App\Models\RegionZipcode;
use Illuminate\Database\Seeder;

final class FloridaRegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding Florida Regions...');

        // 1. Create State: Florida
        $florida = Region::firstOrCreate(
            ['slug' => 'florida'],
            [
                'name' => 'Florida',
                'type' => 'state',
                'is_active' => true,
                'display_order' => 10,
                'latitude' => 27.6648,
                'longitude' => -81.5158,
                'metadata' => [
                    'abbreviation' => 'FL',
                    'workflow_enabled' => false // Disabled by default until transition
                ],
            ]
        );

        // 2. Create County: Pinellas
        $pinellas = Region::firstOrCreate(
            ['slug' => 'pinellas-county'],
            [
                'name' => 'Pinellas County',
                'type' => 'county',
                'parent_id' => $florida->id,
                'is_active' => true,
                'display_order' => 1,
                'latitude' => 27.8764,
                'longitude' => -82.7779,
                'metadata' => [
                    'workflow_enabled' => false
                ],
            ]
        );

        // 3. Define Pinellas Communities
        $communities = [
            [
                'name' => 'St. Petersburg',
                'slug' => 'st-petersburg',
                'lat' => 27.7676, 'lng' => -82.6403,
                'zips' => ['33701', '33702', '33703', '33704', '33705', '33710', '33711', '33712', '33713']
            ],
            [
                'name' => 'Clearwater',
                'slug' => 'clearwater',
                'lat' => 27.9659, 'lng' => -82.8001,
                'zips' => ['33755', '33756', '33759', '33761', '33763', '33764', '33765']
            ],
            [
                'name' => 'Largo',
                'slug' => 'largo',
                'lat' => 27.9095, 'lng' => -82.7873,
                'zips' => ['33770', '33771', '33773', '33774', '33778']
            ],
            [
                'name' => 'Dunedin',
                'slug' => 'dunedin',
                'lat' => 28.0199, 'lng' => -82.7727,
                'zips' => ['34698']
            ],
            [
                'name' => 'Tarpon Springs',
                'slug' => 'tarpon-springs',
                'lat' => 28.1492, 'lng' => -82.7562,
                'zips' => ['34689']
            ],
            [
                'name' => 'Safety Harbor',
                'slug' => 'safety-harbor',
                'lat' => 28.0053, 'lng' => -82.6921,
                'zips' => ['34695']
            ],
            [
                'name' => 'Pinellas Park',
                'slug' => 'pinellas-park',
                'lat' => 27.8587, 'lng' => -82.7161,
                'zips' => ['33781', '33782']
            ],
            [
                'name' => 'Seminole',
                'slug' => 'seminole',
                'lat' => 27.8397, 'lng' => -82.7915,
                'zips' => ['33772', '33776', '33777']
            ],
            [
                'name' => 'Treasure Island',
                'slug' => 'treasure-island',
                'lat' => 27.7692, 'lng' => -82.7687,
                'zips' => ['33706']
            ],
            [
                'name' => 'St. Pete Beach',
                'slug' => 'st-pete-beach',
                'lat' => 27.7253, 'lng' => -82.7412,
                'zips' => ['33706']
            ],
            [
                'name' => 'Madeira Beach',
                'slug' => 'madeira-beach',
                'lat' => 27.7981, 'lng' => -82.7970,
                'zips' => ['33708']
            ],
            [
                'name' => 'Oldsmar',
                'slug' => 'oldsmar',
                'lat' => 28.0342, 'lng' => -82.6651,
                'zips' => ['34677']
            ],
            [
                'name' => 'Gulfport',
                'slug' => 'gulfport',
                'lat' => 27.7409, 'lng' => -82.7107,
                'zips' => ['33707']
            ],
        ];

        foreach ($communities as $data) {
            // Create Region
            $region = Region::firstOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'type' => 'city',
                    'parent_id' => $pinellas->id,
                    'is_active' => true,
                    'latitude' => $data['lat'],
                    'longitude' => $data['lng'],
                    'metadata' => [
                        'workflow_enabled' => false
                    ]
                ]
            );

            // Create Zipcodes
            foreach ($data['zips'] as $index => $zip) {
                RegionZipcode::firstOrCreate(
                    ['region_id' => $region->id, 'zipcode' => $zip],
                    ['is_primary' => $index === 0]
                );
            }

            // Create News Fetch Frequency (This enables the "Seek out news" logic)
            NewsFetchFrequency::firstOrCreate(
                ['region_id' => $region->id],
                [
                    'fetch_interval_minutes' => 60, // Check hourly
                    'last_fetch_at' => null,
                    'is_active' => true,
                    'priority' => 1, // High priority
                ]
            );

            $this->command->info("Seeded {$data['name']} with News Fetching active.");
        }
    }
}

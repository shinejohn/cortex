<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Region;
use App\Models\RegionZipcode;
use Illuminate\Database\Seeder;

final class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Illinois State
        $illinois = Region::create([
            'name' => 'Illinois',
            'slug' => 'illinois',
            'type' => 'state',
            'is_active' => true,
            'display_order' => 1,
            'latitude' => 40.6331,
            'longitude' => -89.3985,
        ]);

        // Cook County
        $cookCounty = Region::create([
            'name' => 'Cook County',
            'slug' => 'cook-county',
            'type' => 'county',
            'parent_id' => $illinois->id,
            'is_active' => true,
            'display_order' => 1,
            'latitude' => 41.8373,
            'longitude' => -87.6862,
        ]);

        // Chicago
        $chicago = Region::create([
            'name' => 'Chicago',
            'slug' => 'chicago',
            'type' => 'city',
            'parent_id' => $cookCounty->id,
            'is_active' => true,
            'display_order' => 1,
            'latitude' => 41.8781,
            'longitude' => -87.6298,
        ]);

        // Chicago Zipcodes
        $chicagoZipcodes = [
            '60601', '60602', '60603', '60604', '60605', '60606', '60607',
            '60608', '60609', '60610', '60611', '60612', '60613', '60614',
            '60615', '60616', '60617', '60618', '60619', '60620', '60621',
            '60622', '60623', '60624', '60625', '60626', '60628', '60629',
            '60630', '60631', '60632', '60633', '60634', '60636', '60637',
            '60638', '60639', '60640', '60641', '60642', '60643', '60644',
            '60645', '60646', '60647', '60649', '60651', '60652', '60653',
            '60654', '60655', '60656', '60657', '60659', '60660', '60661',
        ];

        foreach ($chicagoZipcodes as $index => $zipcode) {
            RegionZipcode::create([
                'region_id' => $chicago->id,
                'zipcode' => $zipcode,
                'is_primary' => $index === 0,
            ]);
        }

        // Chicago Neighborhoods
        $neighborhoods = [
            ['name' => 'Loop', 'slug' => 'loop', 'lat' => 41.8781, 'lng' => -87.6298],
            ['name' => 'Lincoln Park', 'slug' => 'lincoln-park', 'lat' => 41.9212, 'lng' => -87.6501],
            ['name' => 'Wicker Park', 'slug' => 'wicker-park', 'lat' => 41.9089, 'lng' => -87.6773],
            ['name' => 'Hyde Park', 'slug' => 'hyde-park', 'lat' => 41.7943, 'lng' => -87.5907],
            ['name' => 'Lakeview', 'slug' => 'lakeview', 'lat' => 41.9399, 'lng' => -87.6539],
        ];

        foreach ($neighborhoods as $neighborhood) {
            Region::create([
                'name' => $neighborhood['name'],
                'slug' => $neighborhood['slug'],
                'type' => 'neighborhood',
                'parent_id' => $chicago->id,
                'is_active' => true,
                'latitude' => $neighborhood['lat'],
                'longitude' => $neighborhood['lng'],
            ]);
        }

        // DuPage County
        $duPageCounty = Region::create([
            'name' => 'DuPage County',
            'slug' => 'dupage-county',
            'type' => 'county',
            'parent_id' => $illinois->id,
            'is_active' => true,
            'display_order' => 2,
            'latitude' => 41.8486,
            'longitude' => -88.0817,
        ]);

        // Naperville
        $naperville = Region::create([
            'name' => 'Naperville',
            'slug' => 'naperville',
            'type' => 'city',
            'parent_id' => $duPageCounty->id,
            'is_active' => true,
            'latitude' => 41.7508,
            'longitude' => -88.1535,
        ]);

        // Naperville Zipcodes
        $napervilleZipcodes = ['60540', '60563', '60564', '60565'];
        foreach ($napervilleZipcodes as $index => $zipcode) {
            RegionZipcode::create([
                'region_id' => $naperville->id,
                'zipcode' => $zipcode,
                'is_primary' => $index === 0,
            ]);
        }

        // Aurora
        $aurora = Region::create([
            'name' => 'Aurora',
            'slug' => 'aurora',
            'type' => 'city',
            'parent_id' => $duPageCounty->id,
            'is_active' => true,
            'latitude' => 41.7606,
            'longitude' => -88.3201,
        ]);

        // Aurora Zipcodes
        $auroraZipcodes = ['60502', '60503', '60504', '60505', '60506', '60507', '60568', '60572'];
        foreach ($auroraZipcodes as $index => $zipcode) {
            RegionZipcode::create([
                'region_id' => $aurora->id,
                'zipcode' => $zipcode,
                'is_primary' => $index === 0,
            ]);
        }

        $this->command->info('Regions seeded successfully!');
        $this->command->info('Total regions: '.Region::count());
        $this->command->info('Total zipcodes: '.RegionZipcode::count());
    }
}

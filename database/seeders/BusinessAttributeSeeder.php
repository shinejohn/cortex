<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BusinessAttribute;
use App\Models\SmbBusiness;
use Illuminate\Database\Seeder;

final class BusinessAttributeSeeder extends Seeder
{
    /**
     * Seed business attributes.
     */
    public function run(): void
    {
        $smbBusinesses = SmbBusiness::all();

        if ($smbBusinesses->isEmpty()) {
            $this->command->warn('⚠ No SMB businesses found. Run SmbBusinessSeeder first.');

            return;
        }

        foreach ($smbBusinesses as $business) {
            $attributes = [
                'wheelchair_accessible_entrance',
                'wheelchair_accessible_restroom',
                'wheelchair_accessible_seating',
                'restroom',
                'parking',
                'payment_options',
                'dining_options',
                'takeout',
                'delivery',
                'reservations',
            ];

            // Create 3-8 unique attributes per business
            $attributeCount = rand(3, 8);
            $selectedAttributes = collect($attributes)->random($attributeCount);

            foreach ($selectedAttributes as $key) {
                BusinessAttribute::firstOrCreate(
                    [
                        'smb_business_id' => $business->id,
                        'attribute_key' => $key,
                    ],
                    BusinessAttribute::factory()->make([
                        'smb_business_id' => $business->id,
                        'attribute_key' => $key,
                    ])->toArray()
                );
            }
        }

        $totalAttributes = BusinessAttribute::count();
        $this->command->info("✓ Total business attributes: {$totalAttributes}");
    }
}

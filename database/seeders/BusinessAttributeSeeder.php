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
            // Create 3-8 attributes per business
            $attributeCount = rand(3, 8);
            BusinessAttribute::factory($attributeCount)->create([
                'smb_business_id' => $business->id,
            ]);
        }

        $totalAttributes = BusinessAttribute::count();
        $this->command->info("✓ Total business attributes: {$totalAttributes}");
    }
}



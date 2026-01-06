<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BusinessHours;
use App\Models\SmbBusiness;
use Illuminate\Database\Seeder;

final class BusinessHoursSeeder extends Seeder
{
    /**
     * Seed business hours.
     */
    public function run(): void
    {
        $smbBusinesses = SmbBusiness::all();

        if ($smbBusinesses->isEmpty()) {
            $this->command->warn('⚠ No SMB businesses found. Run SmbBusinessSeeder first.');
            return;
        }

        foreach ($smbBusinesses as $business) {
            // Create business hours for each business (one set per business)
            BusinessHours::firstOrCreate(
                ['smb_business_id' => $business->id],
                BusinessHours::factory()->make([
                    'smb_business_id' => $business->id,
                ])->toArray()
            );
        }

        $totalHours = BusinessHours::count();
        $this->command->info("✓ Total business hours records: {$totalHours}");
    }
}



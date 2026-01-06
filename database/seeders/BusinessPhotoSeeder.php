<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BusinessPhoto;
use App\Models\SmbBusiness;
use Illuminate\Database\Seeder;

final class BusinessPhotoSeeder extends Seeder
{
    /**
     * Seed business photos.
     */
    public function run(): void
    {
        $smbBusinesses = SmbBusiness::all();

        if ($smbBusinesses->isEmpty()) {
            $this->command->warn('⚠ No SMB businesses found. Run SmbBusinessSeeder first.');
            return;
        }

        foreach ($smbBusinesses as $business) {
            // Create 5-10 photos per business
            $photoCount = rand(5, 10);
            BusinessPhoto::factory($photoCount)->create([
                'smb_business_id' => $business->id,
            ]);
        }

        $totalPhotos = BusinessPhoto::count();
        $this->command->info("✓ Total business photos: {$totalPhotos}");
    }
}



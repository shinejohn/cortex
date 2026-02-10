<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BusinessReview;
use App\Models\Customer;
use App\Models\SmbBusiness;
use Illuminate\Database\Seeder;

final class BusinessReviewSeeder extends Seeder
{
    /**
     * Seed business reviews (CRM).
     */
    public function run(): void
    {
        $smbBusinesses = SmbBusiness::all();
        $customers = Customer::all();

        if ($smbBusinesses->isEmpty() || $customers->isEmpty()) {
            $this->command->warn('⚠ No SMB businesses or customers found. Run SmbBusinessSeeder and CustomerSeeder first.');

            return;
        }

        foreach ($smbBusinesses as $business) {
            // Create 2-5 reviews per business
            $reviewCount = rand(2, 5);
            $availableCustomers = $customers->random(min($reviewCount, $customers->count()));

            foreach ($availableCustomers as $customer) {
                BusinessReview::firstOrCreate(
                    [
                        'smb_business_id' => $business->id,
                        'author_name' => $customer->full_name,
                    ],
                    BusinessReview::factory()->make([
                        'smb_business_id' => $business->id,
                        'author_name' => $customer->full_name,
                    ])->toArray()
                );
            }
        }

        $totalReviews = BusinessReview::count();
        $this->command->info("✓ Total business reviews: {$totalReviews}");
    }
}

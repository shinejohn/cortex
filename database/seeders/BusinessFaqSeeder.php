<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\BusinessFaq;
use Illuminate\Database\Seeder;

final class BusinessFaqSeeder extends Seeder
{
    /**
     * Seed business FAQs.
     */
    public function run(): void
    {
        $businesses = Business::all();

        if ($businesses->isEmpty()) {
            $this->command->warn('⚠ No businesses found. Run BusinessSeeder first.');
            return;
        }

        foreach ($businesses->take(50) as $business) {
            // Create 3-8 FAQs per business
            $faqCount = rand(3, 8);
            BusinessFaq::factory($faqCount)->create([
                'business_id' => $business->id,
            ]);
        }

        $totalFaqs = BusinessFaq::count();
        $this->command->info("✓ Total business FAQs: {$totalFaqs}");
    }
}



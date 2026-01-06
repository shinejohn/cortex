<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Classified;
use App\Models\ClassifiedPayment;
use Illuminate\Database\Seeder;

final class ClassifiedPaymentSeeder extends Seeder
{
    /**
     * Seed classified payments.
     */
    public function run(): void
    {
        $classifieds = Classified::where('status', 'published')->get();

        if ($classifieds->isEmpty()) {
            $this->command->warn('⚠ No published classifieds found. Run ClassifiedSeeder first.');
            return;
        }

        // Create payments for 30% of published classifieds
        $classifiedsToPay = $classifieds->random(ceil($classifieds->count() * 0.3));

        foreach ($classifiedsToPay as $classified) {
            ClassifiedPayment::firstOrCreate(
                ['classified_id' => $classified->id],
                ClassifiedPayment::factory()->make([
                    'classified_id' => $classified->id,
                ])->toArray()
            );
        }

        $totalPayments = ClassifiedPayment::count();
        $this->command->info("✓ Total classified payments: {$totalPayments}");
    }
}



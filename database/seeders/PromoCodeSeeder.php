<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Event;
use App\Models\PromoCode;
use Illuminate\Database\Seeder;

final class PromoCodeSeeder extends Seeder
{
    /**
     * Seed promo codes.
     */
    public function run(): void
    {
        $events = Event::all();

        // Create promo codes using factory
        $targetCount = 30;
        $promoCodes = PromoCode::factory($targetCount)->create();

        $this->command->info("✓ Created {$targetCount} promo codes");
        $this->command->info('✓ Total promo codes: '.PromoCode::count());
    }
}

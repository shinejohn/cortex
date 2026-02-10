<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\BusinessSubscription;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class BusinessSubscriptionSeeder extends Seeder
{
    /**
     * Seed business subscriptions.
     */
    public function run(): void
    {
        $businesses = Business::all();
        $workspaces = Workspace::all();

        if ($businesses->isEmpty() || $workspaces->isEmpty()) {
            $this->command->warn('⚠ No businesses or workspaces found. Run BusinessSeeder and WorkspaceSeeder first.');

            return;
        }

        // Create subscriptions for 30% of businesses
        $count = (int) ceil($businesses->count() * 0.3);
        $businessesToSubscribe = $businesses->random($count);

        foreach ($businessesToSubscribe as $business) {
            BusinessSubscription::firstOrCreate(
                [
                    'business_id' => $business->id,
                ],
                BusinessSubscription::factory()->make([
                    'business_id' => $business->id,
                ])->toArray()
            );
        }

        $totalSubscriptions = BusinessSubscription::count();
        $this->command->info("✓ Total business subscriptions: {$totalSubscriptions}");
    }
}

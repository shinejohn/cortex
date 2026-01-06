<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Customer;
use Illuminate\Database\Seeder;

final class CampaignRecipientSeeder extends Seeder
{
    /**
     * Seed campaign recipients.
     */
    public function run(): void
    {
        $campaigns = Campaign::all();
        $customers = Customer::all();

        if ($campaigns->isEmpty() || $customers->isEmpty()) {
            $this->command->warn('⚠ No campaigns or customers found. Run CampaignSeeder and CustomerSeeder first.');
            return;
        }

        foreach ($campaigns as $campaign) {
            // Add 10-50 recipients per campaign
            $recipientCount = rand(10, 50);
            $availableCustomers = $customers->random(min($recipientCount, $customers->count()));

            foreach ($availableCustomers as $customer) {
                CampaignRecipient::firstOrCreate(
                    [
                        'campaign_id' => $campaign->id,
                        'customer_id' => $customer->id,
                    ],
                    CampaignRecipient::factory()->make([
                        'campaign_id' => $campaign->id,
                        'customer_id' => $customer->id,
                    ])->toArray()
                );
            }
        }

        $totalRecipients = CampaignRecipient::count();
        $this->command->info("✓ Total campaign recipients: {$totalRecipients}");
    }
}



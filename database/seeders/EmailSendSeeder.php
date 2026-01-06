<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmailCampaign;
use App\Models\EmailSend;
use App\Models\EmailSubscriber;
use Illuminate\Database\Seeder;

final class EmailSendSeeder extends Seeder
{
    /**
     * Seed email sends.
     */
    public function run(): void
    {
        $campaigns = EmailCampaign::all();
        $subscribers = EmailSubscriber::all();

        if ($campaigns->isEmpty() || $subscribers->isEmpty()) {
            $this->command->warn('⚠ No email campaigns or subscribers found. Run EmailCampaignSeeder and EmailSubscriberSeeder first.');
            return;
        }

        foreach ($campaigns as $campaign) {
            // Send to 20-50 subscribers per campaign
            $sendCount = rand(20, 50);
            $availableSubscribers = $subscribers->random(min($sendCount, $subscribers->count()));

            foreach ($availableSubscribers as $subscriber) {
                EmailSend::firstOrCreate(
                    [
                        'campaign_id' => $campaign->id,
                        'subscriber_id' => $subscriber->id,
                    ],
                    EmailSend::factory()->make([
                        'campaign_id' => $campaign->id,
                        'subscriber_id' => $subscriber->id,
                    ])->toArray()
                );
            }
        }

        $totalSends = EmailSend::count();
        $this->command->info("✓ Total email sends: {$totalSends}");
    }
}



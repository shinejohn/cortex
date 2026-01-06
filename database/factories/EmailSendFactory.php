<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmailSend>
 */
class EmailSendFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'campaign_id' => \App\Models\EmailCampaign::factory(),
            'subscriber_id' => \App\Models\EmailSubscriber::factory(),
            'message_id' => $this->faker->optional()->uuid(),
            'status' => $this->faker->randomElement(['queued', 'sent', 'delivered', 'bounced', 'complained', 'failed']),
            'sent_at' => $this->faker->optional()->dateTime(),
            'delivered_at' => $this->faker->optional()->dateTime(),
            'opened_at' => $this->faker->optional()->dateTime(),
            'open_count' => 0,
            'clicked_at' => $this->faker->optional()->dateTime(),
            'click_count' => 0,
            'bounce_type' => $this->faker->optional()->word(),
            'error_message' => $this->faker->optional()->text(),
        ];
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmailCampaign>
 */
class EmailCampaignFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'uuid' => \Illuminate\Support\Str::uuid(),
            'community_id' => \App\Models\Community::factory(),
            'template_id' => $this->faker->optional()->randomElement([\App\Models\EmailTemplate::factory(), null]),
            'name' => $this->faker->sentence(),
            'type' => $this->faker->randomElement(['daily_digest', 'breaking_news', 'weekly_newsletter', 'smb_report', 'emergency', 'custom']),
            'status' => $this->faker->randomElement(['draft', 'scheduled', 'sending', 'sent', 'cancelled']),
            'subject' => $this->faker->sentence(),
            'preview_text' => $this->faker->optional()->sentence(),
            'html_content' => $this->faker->optional()->paragraph(),
            'text_content' => $this->faker->optional()->paragraph(),
            'segment' => $this->faker->optional()->randomElements(['key' => 'value'], 1),
            'scheduled_at' => $this->faker->optional()->dateTime(),
            'started_at' => $this->faker->optional()->dateTime(),
            'completed_at' => $this->faker->optional()->dateTime(),
            'total_recipients' => $this->faker->numberBetween(0, 1000),
            'sent_count' => $this->faker->numberBetween(0, 100),
            'delivered_count' => $this->faker->numberBetween(0, 100),
            'opened_count' => $this->faker->numberBetween(0, 100),
            'clicked_count' => $this->faker->numberBetween(0, 100),
            'bounced_count' => $this->faker->numberBetween(0, 100),
            'complained_count' => $this->faker->numberBetween(0, 100),
            'unsubscribed_count' => $this->faker->numberBetween(0, 100),
        ];
    }
}

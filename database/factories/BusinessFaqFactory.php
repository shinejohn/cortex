<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BusinessFaq>
 */
class BusinessFaqFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'business_id' => \App\Models\Business::factory(),
            'question' => $this->faker->word(),
            'answer' => $this->faker->word(),
            'category' => $this->faker->dateTime(),
            'tags' => $this->faker->word(),
            'variations' => $this->faker->dateTime(),
            'follow_up_questions' => $this->faker->word(),
            'times_used' => $this->faker->word(),
            'helpful_votes' => $this->faker->word(),
            'unhelpful_votes' => $this->faker->word(),
            'is_active' => $this->faker->boolean(),
            'display_order' => $this->faker->word(),
        ];
    }
}

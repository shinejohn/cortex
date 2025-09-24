<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SocialPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialPostLike>
 */
final class SocialPostLikeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'post_id' => SocialPost::factory(),
            'user_id' => User::factory(),
        ];
    }
}

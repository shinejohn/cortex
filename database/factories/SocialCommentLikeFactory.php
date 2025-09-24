<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SocialPostComment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialCommentLike>
 */
final class SocialCommentLikeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'comment_id' => SocialPostComment::factory(),
            'user_id' => User::factory(),
        ];
    }
}

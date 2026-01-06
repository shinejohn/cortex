<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CommunityThreadReplyLike;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CommunityThreadReplyLike>
 */
final class CommunityThreadReplyLikeFactory extends Factory
{
    /**
     * The name of the corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = CommunityThreadReplyLike::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'reply_id' => \App\Models\CommunityThreadReply::factory(),
            'user_id' => \App\Models\User::factory(),
        ];
    }
}

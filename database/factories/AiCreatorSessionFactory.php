<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\AiCreatorSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AiCreatorSession>
 */
final class AiCreatorSessionFactory extends Factory
{
    protected $model = AiCreatorSession::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'region_id' => null,
            'content_type' => 'article',
            'status' => 'active',
            'seo_analysis' => null,
            'quality_analysis' => null,
            'fact_check_results' => null,
            'classification' => null,
            'moderation_result' => null,
            'current_title' => null,
            'current_content' => null,
            'ai_suggestions' => null,
            'published_content_id' => null,
            'published_content_type' => null,
        ];
    }
}

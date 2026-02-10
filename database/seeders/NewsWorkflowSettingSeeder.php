<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsWorkflowSetting;
use Illuminate\Database\Seeder;

final class NewsWorkflowSettingSeeder extends Seeder
{
    /**
     * Seed news workflow settings.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'fetch_frequency',
                'value' => 'daily',
                'type' => 'string',
                'description' => 'How often to fetch news',
            ],
            [
                'key' => 'max_articles_per_run',
                'value' => '100',
                'type' => 'integer',
                'description' => 'Maximum articles to process per run',
            ],
            [
                'key' => 'enable_auto_publish',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Whether to automatically publish processed articles',
            ],
            [
                'key' => 'enable_fact_check',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Whether to verify claims using fact checking',
            ],
        ];

        foreach ($settings as $setting) {
            NewsWorkflowSetting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $totalSettings = NewsWorkflowSetting::count();
        $this->command->info("✓ Total workflow settings: {$totalSettings}");
    }
}

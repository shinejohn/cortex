<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\NewsWorkflowSetting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

final class NewsWorkflowConfigProvider extends ServiceProvider
{
    /**
     * Mapping of database keys to config paths.
     *
     * @var array<string, string>
     */
    private const CONFIG_MAP = [
        'business_discovery_enabled' => 'news-workflow.business_discovery.enabled',
        'news_collection_enabled' => 'news-workflow.news_collection.enabled',
        'shortlisting_enabled' => 'news-workflow.shortlisting.enabled',
        'fact_checking_enabled' => 'news-workflow.fact_checking.enabled',
        'final_selection_enabled' => 'news-workflow.final_selection.enabled',
        'article_generation_enabled' => 'news-workflow.article_generation.enabled',
        'publishing_enabled' => 'news-workflow.publishing.enabled',
        'event_extraction_enabled' => 'news-workflow.event_extraction.enabled',
        'unsplash_enabled' => 'news-workflow.unsplash.enabled',
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Only override if the table exists (avoid errors during migrations)
        if (! Schema::hasTable('news_workflow_settings')) {
            return;
        }

        $this->overrideConfigFromDatabase();
    }

    /**
     * Load settings from database and override config values.
     */
    private function overrideConfigFromDatabase(): void
    {
        $settings = NewsWorkflowSetting::getAllCached();

        foreach (self::CONFIG_MAP as $dbKey => $configPath) {
            if (isset($settings[$dbKey])) {
                $value = $this->castValue($settings[$dbKey]['value'], $settings[$dbKey]['type']);
                config()->set($configPath, $value);
            }
        }
    }

    /**
     * Cast a value to its proper type.
     */
    private function castValue(string $value, string $type): mixed
    {
        return match ($type) {
            'boolean' => in_array(mb_strtolower($value), ['true', '1', 'yes'], true),
            'integer' => (int) $value,
            'float' => (float) $value,
            default => $value,
        };
    }
}

<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\NewsWorkflowSetting;

final class WorkflowSettingsService
{
    /**
     * Mapping of phase names to their config paths.
     *
     * @var array<string, string>
     */
    private const PHASE_CONFIG_MAP = [
        'business_discovery' => 'news-workflow.business_discovery.enabled',
        'news_collection' => 'news-workflow.news_collection.enabled',
        'shortlisting' => 'news-workflow.shortlisting.enabled',
        'fact_checking' => 'news-workflow.fact_checking.enabled',
        'final_selection' => 'news-workflow.final_selection.enabled',
        'article_generation' => 'news-workflow.article_generation.enabled',
        'publishing' => 'news-workflow.publishing.enabled',
        'event_extraction' => 'news-workflow.event_extraction.enabled',
        'unsplash' => 'news-workflow.unsplash.enabled',
        'skip_business_sources' => 'news-workflow.news_collection.skip_business_sources',
    ];

    /**
     * Check if a workflow phase is enabled.
     * Checks database first (admin overrides), then falls back to config.
     */
    public function isPhaseEnabled(string $phase): bool
    {
        $dbKey = $phase.'_enabled';

        // Check database first (admin overrides take priority)
        $dbValue = NewsWorkflowSetting::get($dbKey);

        if ($dbValue !== null) {
            return (bool) $dbValue;
        }

        // Fall back to config
        $configKey = self::PHASE_CONFIG_MAP[$phase] ?? null;

        if ($configKey === null) {
            return true;
        }

        return (bool) config($configKey, true);
    }

    /**
     * Get all phase statuses.
     *
     * @return array<string, bool>
     */
    public function getAllPhaseStatuses(): array
    {
        $statuses = [];

        foreach (array_keys(self::PHASE_CONFIG_MAP) as $phase) {
            $statuses[$phase] = $this->isPhaseEnabled($phase);
        }

        return $statuses;
    }

    /**
     * Set a phase enabled/disabled status.
     */
    public function setPhaseEnabled(string $phase, bool $enabled): void
    {
        $dbKey = $phase.'_enabled';
        $description = self::PHASE_CONFIG_MAP[$phase] ?? null;

        NewsWorkflowSetting::set($dbKey, $enabled, $description);
    }

    /**
     * Sync all phases from config to database (for initialization).
     *
     * @return int Number of phases synced
     */
    public function syncFromConfig(): int
    {
        $synced = 0;

        foreach (self::PHASE_CONFIG_MAP as $phase => $configKey) {
            $dbKey = $phase.'_enabled';

            // Only sync if not already in database
            if (NewsWorkflowSetting::get($dbKey) === null) {
                $configValue = (bool) config($configKey, true);
                NewsWorkflowSetting::set($dbKey, $configValue, "Enable/disable {$phase} phase");
                $synced++;
            }
        }

        return $synced;
    }
}

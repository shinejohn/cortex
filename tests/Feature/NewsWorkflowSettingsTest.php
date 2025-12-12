<?php

declare(strict_types=1);

use App\Models\NewsWorkflowSetting;
use App\Services\News\WorkflowSettingsService;
use Illuminate\Support\Facades\Cache;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('NewsWorkflowSetting Model', function () {
    it('can set and get a boolean setting', function () {
        NewsWorkflowSetting::set('business_discovery_enabled', true, 'Test description');

        expect(NewsWorkflowSetting::get('business_discovery_enabled'))->toBeTrue();
    });

    it('can set and get a false boolean setting', function () {
        NewsWorkflowSetting::set('business_discovery_enabled', false, 'Test description');

        expect(NewsWorkflowSetting::get('business_discovery_enabled'))->toBeFalse();
    });

    it('returns default value when setting does not exist', function () {
        expect(NewsWorkflowSetting::get('nonexistent_key', 'default'))->toBe('default');
    });

    it('returns null when setting does not exist and no default provided', function () {
        expect(NewsWorkflowSetting::get('nonexistent_key'))->toBeNull();
    });

    it('updates existing setting instead of creating duplicate', function () {
        NewsWorkflowSetting::set('test_key', true);
        NewsWorkflowSetting::set('test_key', false);

        expect(NewsWorkflowSetting::query()->where('key', 'test_key')->count())->toBe(1);
        expect(NewsWorkflowSetting::get('test_key'))->toBeFalse();
    });

    it('caches settings for performance', function () {
        NewsWorkflowSetting::set('cached_key', true);

        // Clear cache to simulate fresh state
        Cache::forget('news_workflow_settings');

        // First call populates cache
        NewsWorkflowSetting::get('cached_key');

        expect(Cache::has('news_workflow_settings'))->toBeTrue();
    });

    it('clears cache when setting is updated', function () {
        NewsWorkflowSetting::set('test_key', true);

        expect(Cache::has('news_workflow_settings'))->toBeFalse();
    });
});

describe('WorkflowSettingsService', function () {
    it('checks if phase is enabled from database', function () {
        NewsWorkflowSetting::set('business_discovery_enabled', false);

        $service = new WorkflowSettingsService;

        expect($service->isPhaseEnabled('business_discovery'))->toBeFalse();
    });

    it('falls back to config when database has no value', function () {
        config(['news-workflow.business_discovery.enabled' => false]);

        $service = new WorkflowSettingsService;

        expect($service->isPhaseEnabled('business_discovery'))->toBeFalse();
    });

    it('returns true by default when no config or database value', function () {
        $service = new WorkflowSettingsService;

        expect($service->isPhaseEnabled('nonexistent_phase'))->toBeTrue();
    });

    it('database value takes priority over config', function () {
        config(['news-workflow.business_discovery.enabled' => true]);
        NewsWorkflowSetting::set('business_discovery_enabled', false);

        $service = new WorkflowSettingsService;

        expect($service->isPhaseEnabled('business_discovery'))->toBeFalse();
    });

    it('can set phase enabled status', function () {
        $service = new WorkflowSettingsService;
        $service->setPhaseEnabled('publishing', false);

        expect($service->isPhaseEnabled('publishing'))->toBeFalse();
    });

    it('gets all phase statuses', function () {
        $service = new WorkflowSettingsService;
        $statuses = $service->getAllPhaseStatuses();

        expect($statuses)->toHaveKeys([
            'business_discovery',
            'news_collection',
            'shortlisting',
            'fact_checking',
            'final_selection',
            'article_generation',
            'publishing',
            'event_extraction',
            'unsplash',
            'skip_business_sources',
        ]);
    });

    it('can enable and disable skip_business_sources setting', function () {
        $service = new WorkflowSettingsService;

        // Default should be false (from config)
        expect($service->isPhaseEnabled('skip_business_sources'))->toBeFalse();

        // Enable it
        $service->setPhaseEnabled('skip_business_sources', true);
        expect($service->isPhaseEnabled('skip_business_sources'))->toBeTrue();

        // Disable it
        $service->setPhaseEnabled('skip_business_sources', false);
        expect($service->isPhaseEnabled('skip_business_sources'))->toBeFalse();
    });

    it('syncs phases from config to database', function () {
        config(['news-workflow.fact_checking.enabled' => false]);

        $service = new WorkflowSettingsService;
        $synced = $service->syncFromConfig();

        expect($synced)->toBeGreaterThan(0);
        expect($service->isPhaseEnabled('fact_checking'))->toBeFalse();
    });
});

describe('NewsWorkflowSetting Value Casting', function () {
    it('casts boolean true values correctly', function () {
        NewsWorkflowSetting::create([
            'key' => 'bool_true',
            'value' => 'true',
            'type' => 'boolean',
        ]);
        NewsWorkflowSetting::clearCache();

        expect(NewsWorkflowSetting::get('bool_true'))->toBeTrue();
    });

    it('casts boolean false values correctly', function () {
        NewsWorkflowSetting::create([
            'key' => 'bool_false',
            'value' => 'false',
            'type' => 'boolean',
        ]);
        NewsWorkflowSetting::clearCache();

        expect(NewsWorkflowSetting::get('bool_false'))->toBeFalse();
    });

    it('casts integer values correctly', function () {
        NewsWorkflowSetting::create([
            'key' => 'int_value',
            'value' => '42',
            'type' => 'integer',
        ]);
        NewsWorkflowSetting::clearCache();

        expect(NewsWorkflowSetting::get('int_value'))->toBe(42);
    });

    it('casts string values correctly', function () {
        NewsWorkflowSetting::create([
            'key' => 'string_value',
            'value' => 'test string',
            'type' => 'string',
        ]);
        NewsWorkflowSetting::clearCache();

        expect(NewsWorkflowSetting::get('string_value'))->toBe('test string');
    });
});

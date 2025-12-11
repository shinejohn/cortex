<?php

declare(strict_types=1);

use App\Models\NewsWorkflowSetting;
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

    it('checks if phase is enabled using isEnabled helper', function () {
        NewsWorkflowSetting::set('business_discovery_enabled', true);

        expect(NewsWorkflowSetting::isEnabled('business_discovery'))->toBeTrue();
    });

    it('returns true by default for isEnabled when setting does not exist', function () {
        expect(NewsWorkflowSetting::isEnabled('nonexistent_phase'))->toBeTrue();
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

<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

final class NewsWorkflowSetting extends Model
{
    private const CACHE_KEY = 'news_workflow_settings';

    private const CACHE_TTL = 3600; // 1 hour

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $settings = self::getAllCached();

        if (! isset($settings[$key])) {
            return $default;
        }

        return self::castValue($settings[$key]['value'], $settings[$key]['type']);
    }

    /**
     * Set a setting value.
     */
    public static function set(string $key, mixed $value, ?string $description = null): void
    {
        $setting = self::query()->where('key', $key)->first();

        $stringValue = is_bool($value) ? ($value ? 'true' : 'false') : (string) $value;

        if ($setting) {
            $setting->update(['value' => $stringValue]);
        } else {
            self::create([
                'key' => $key,
                'value' => $stringValue,
                'type' => is_bool($value) ? 'boolean' : 'string',
                'description' => $description,
            ]);
        }

        self::clearCache();
    }

    /**
     * Get all settings as cached array.
     *
     * @return array<string, array{value: string, type: string}>
     */
    public static function getAllCached(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return self::query()
                ->get()
                ->keyBy('key')
                ->map(fn ($setting) => [
                    'value' => $setting->value,
                    'type' => $setting->type,
                ])
                ->toArray();
        });
    }

    /**
     * Clear the settings cache.
     */
    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Cast a value to its proper type.
     */
    private static function castValue(string $value, string $type): mixed
    {
        return match ($type) {
            'boolean' => in_array(mb_strtolower($value), ['true', '1', 'yes'], true),
            'integer' => (int) $value,
            'float' => (float) $value,
            default => $value,
        };
    }
}

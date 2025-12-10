<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class NewsFetchFrequency extends Model
{
    use HasFactory, HasUuids;

    public const FREQUENCY_DAILY = 'daily';

    public const FREQUENCY_WEEKLY = 'weekly';

    public const FREQUENCY_MONTHLY = 'monthly';

    public const FREQUENCY_CUSTOM_DAYS = 'custom_days';

    public const CATEGORY_TYPE_NEWS = 'news_category';

    public const CATEGORY_TYPE_BUSINESS = 'business_category';

    protected $fillable = [
        'category',
        'category_type',
        'frequency_type',
        'custom_interval_days',
        'last_fetched_at',
        'is_enabled',
        'metadata',
    ];

    /**
     * @return array<string, string>
     */
    public static function frequencyOptions(): array
    {
        return [
            self::FREQUENCY_DAILY => 'Daily',
            self::FREQUENCY_WEEKLY => 'Weekly',
            self::FREQUENCY_MONTHLY => 'Monthly',
            self::FREQUENCY_CUSTOM_DAYS => 'Custom Days',
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function categoryTypeOptions(): array
    {
        return [
            self::CATEGORY_TYPE_NEWS => 'News Category',
            self::CATEGORY_TYPE_BUSINESS => 'Business Category',
        ];
    }

    /**
     * @param  Builder<NewsFetchFrequency>  $query
     * @return Builder<NewsFetchFrequency>
     */
    public function scopeEnabled(Builder $query): Builder
    {
        return $query->where('is_enabled', true);
    }

    /**
     * @param  Builder<NewsFetchFrequency>  $query
     * @return Builder<NewsFetchFrequency>
     */
    public function scopeForNewsCategories(Builder $query): Builder
    {
        return $query->where('category_type', self::CATEGORY_TYPE_NEWS);
    }

    /**
     * @param  Builder<NewsFetchFrequency>  $query
     * @return Builder<NewsFetchFrequency>
     */
    public function scopeForBusinessCategories(Builder $query): Builder
    {
        return $query->where('category_type', self::CATEGORY_TYPE_BUSINESS);
    }

    /**
     * @param  Builder<NewsFetchFrequency>  $query
     * @return Builder<NewsFetchFrequency>
     */
    public function scopeForCategory(Builder $query, string $category, string $categoryType): Builder
    {
        return $query->where('category', $category)->where('category_type', $categoryType);
    }

    public function getIntervalInDays(): int
    {
        return match ($this->frequency_type) {
            self::FREQUENCY_DAILY => 1,
            self::FREQUENCY_WEEKLY => 7,
            self::FREQUENCY_MONTHLY => 30,
            self::FREQUENCY_CUSTOM_DAYS => $this->custom_interval_days ?? 1,
            default => 1,
        };
    }

    public function shouldFetchToday(): bool
    {
        if (! $this->is_enabled) {
            return false;
        }

        if ($this->last_fetched_at === null) {
            return true;
        }

        $daysSinceLastFetch = $this->last_fetched_at->diffInDays(now());

        return $daysSinceLastFetch >= $this->getIntervalInDays();
    }

    public function markAsFetched(): void
    {
        $this->update(['last_fetched_at' => now()]);
    }

    public function getNextFetchDate(): ?\Carbon\CarbonInterface
    {
        if ($this->last_fetched_at === null) {
            return now();
        }

        return $this->last_fetched_at->addDays($this->getIntervalInDays());
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'custom_interval_days' => 'integer',
            'last_fetched_at' => 'datetime',
            'is_enabled' => 'boolean',
            'metadata' => 'array',
        ];
    }
}

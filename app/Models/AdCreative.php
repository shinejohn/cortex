<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

final class AdCreative extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'campaign_id',
        'name',
        'format',
        'headline',
        'body',
        'image_url',
        'video_url',
        'audio_url',
        'click_url',
        'cta_text',
        'status',
        'width',
        'height',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model): void {
            $model->uuid = $model->uuid ?? Str::uuid()->toString();
        });
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AdCampaign::class, 'campaign_id');
    }

    public function impressions(): HasMany
    {
        return $this->hasMany(AdImpression::class, 'creative_id');
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(AdClick::class, 'creative_id');
    }

    public function getCtrAttribute(): float
    {
        $impressions = $this->impressions()->count();
        if ($impressions === 0) {
            return 0.0;
        }

        return round(($this->clicks()->count() / $impressions) * 100, 2);
    }
}

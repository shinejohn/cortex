<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

final class EmailCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'community_id',
        'template_id',
        'name',
        'type',
        'status',
        'subject',
        'preview_text',
        'html_content',
        'text_content',
        'segment',
        'scheduled_at',
        'started_at',
        'completed_at',
        'total_recipients',
        'sent_count',
        'delivered_count',
        'opened_count',
        'clicked_count',
        'bounced_count',
        'complained_count',
        'unsubscribed_count',
    ];

    protected $casts = [
        'segment' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model): void {
            $model->uuid = $model->uuid ?? Str::uuid()->toString();
        });
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class);
    }

    public function sends(): HasMany
    {
        return $this->hasMany(EmailSend::class, 'campaign_id');
    }

    public function getOpenRateAttribute(): float
    {
        if ($this->delivered_count === 0) {
            return 0.0;
        }

        return round(($this->opened_count / $this->delivered_count) * 100, 2);
    }

    public function getClickRateAttribute(): float
    {
        if ($this->opened_count === 0) {
            return 0.0;
        }

        return round(($this->clicked_count / $this->opened_count) * 100, 2);
    }
}

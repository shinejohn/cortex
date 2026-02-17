<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class ReporterOutreachRequest extends Model
{
    use HasUuids;

    public const STATUS_PENDING = 'pending';

    public const STATUS_SENT = 'sent';

    public const STATUS_RESPONDED = 'responded';

    public const STATUS_BOUNCED = 'bounced';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'region_id',
        'day_news_post_id',
        'business_id',
        'contact_email',
        'email_subject',
        'email_body',
        'sent_at',
        'response_received_at',
        'status',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function dayNewsPost(): BelongsTo
    {
        return $this->belongsTo(DayNewsPost::class, 'day_news_post_id');
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function response(): HasOne
    {
        return $this->hasOne(ReporterResponse::class, 'outreach_request_id');
    }

    public function scopeSent($query)
    {
        return $query->where('status', self::STATUS_SENT);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'response_received_at' => 'datetime',
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

final class ContentModerationLog extends Model
{
    use HasFactory, HasUuid;

    public const DECISION_PASS = 'pass';

    public const DECISION_FAIL = 'fail';

    public const TRIGGER_CREATE = 'on_create';

    public const TRIGGER_UPDATE = 'on_update';

    public const TRIGGER_PUBLISH = 'on_publish';

    public const TRIGGER_COMMENT = 'on_comment';

    public const TRIGGER_COMPLAINT = 'on_complaint';

    public const TRIGGER_INTERVENTION = 'on_intervention';

    public const APPEAL_PENDING = 'pending';

    public const APPEAL_OVERTURNED = 'overturned';

    public const APPEAL_UPHELD = 'upheld';

    protected $fillable = [
        'content_type',
        'content_id',
        'region_id',
        'user_id',
        'trigger',
        'content_snapshot',
        'metadata',
        'decision',
        'violation_section',
        'violation_explanation',
        'ai_model',
        'processing_ms',
        'appeal_status',
    ];

    public function content(): MorphTo
    {
        return $this->morphTo('content', 'content_type', 'content_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function scopeFailed($query)
    {
        return $query->where('decision', self::DECISION_FAIL);
    }

    public function scopePassed($query)
    {
        return $query->where('decision', self::DECISION_PASS);
    }

    public function scopeForContent($query, string $type, string $id)
    {
        return $query->where('content_type', $type)->where('content_id', $id);
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'processing_ms' => 'integer',
        ];
    }
}

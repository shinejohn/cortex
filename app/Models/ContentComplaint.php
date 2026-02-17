<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

final class ContentComplaint extends Model
{
    use HasFactory, HasUuid;

    public const REASON_HATE_SPEECH = 'hate_speech';

    public const REASON_THREATS = 'threats';

    public const REASON_SPAM = 'spam';

    public const REASON_MISINFORMATION = 'misinformation';

    public const REASON_INAPPROPRIATE = 'inappropriate';

    public const REASON_PII = 'pii';

    public const REASON_COPYRIGHT = 'copyright';

    public const REASON_OTHER = 'other';

    public const REASONS = [
        self::REASON_HATE_SPEECH => 'Hate Speech or Discrimination',
        self::REASON_THREATS => 'Threats of Violence',
        self::REASON_SPAM => 'Spam or Promotional Content',
        self::REASON_MISINFORMATION => 'Misinformation',
        self::REASON_INAPPROPRIATE => 'Inappropriate Content',
        self::REASON_PII => 'Personal Information Exposure',
        self::REASON_COPYRIGHT => 'Copyright Violation',
        self::REASON_OTHER => 'Other',
    ];

    public const TYPE_USER = 'user';

    public const TYPE_CREATOR_APPEAL = 'creator_appeal';

    protected $fillable = [
        'content_type',
        'content_id',
        'complainant_id',
        'complaint_reason',
        'complaint_text',
        'complaint_type',
        'review_decision',
        'review_explanation',
        'review_moderation_log_id',
        'reviewed_at',
    ];

    public function content(): MorphTo
    {
        return $this->morphTo('content', 'content_type', 'content_id');
    }

    public function complainant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'complainant_id');
    }

    public function moderationLog(): BelongsTo
    {
        return $this->belongsTo(ContentModerationLog::class, 'review_moderation_log_id');
    }

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }
}

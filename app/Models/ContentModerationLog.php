<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ContentModerationLog extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'content_type',
        'content_id',
        'region_id',
        'user_id',
        'trigger',
        'content_snapshot',
        'metadata',
        'status',
        'confidence_score',
        'flags',
        'suggestions',
        'moderator_notes',
        'moderator_type',
        'moderator_id',
        'ai_model',
        'resolution',
        'resolved_by',
        'resolved_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFlagged($query)
    {
        return $query->where('status', 'flagged');
    }

    public function scopeForContent($query, string $type, string $id)
    {
        return $query->where('content_type', $type)->where('content_id', $id);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function needsReview(): bool
    {
        return in_array($this->status, ['needs_review', 'flagged']);
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'flags' => 'array',
            'suggestions' => 'array',
            'confidence_score' => 'decimal:4',
            'resolved_at' => 'datetime',
        ];
    }
}

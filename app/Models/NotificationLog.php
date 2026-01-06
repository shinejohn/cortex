<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class NotificationLog extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'notification_log';

    protected $fillable = [
        'platform',
        'community_id',
        'notification_type',
        'channel',
        'title',
        'message',
        'payload',
        'recipient_count',
        'sns_message_id',
        'status',
        'error_message',
        'sent_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'recipient_count' => 'integer',
        'sent_at' => 'datetime',
    ];

    /**
     * Scope: For specific platform
     */
    public function scopeForPlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope: For specific community
     */
    public function scopeForCommunity($query, string $communityId)
    {
        return $query->where('community_id', $communityId);
    }

    /**
     * Scope: By status
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Mark as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark as failed
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Mark as partial (some succeeded, some failed)
     */
    public function markAsPartial(): void
    {
        $this->update([
            'status' => 'partial',
            'sent_at' => now(),
        ]);
    }
}

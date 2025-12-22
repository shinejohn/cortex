<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TicketGift extends Model
{
    /** @use HasFactory<\Database\Factories\TicketGiftFactory> */
    use HasFactory, HasUuid;

    public const STATUS_PENDING = 'pending';
    public const STATUS_REDEEMED = 'redeemed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_EXPIRED = 'expired';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_REDEEMED,
        self::STATUS_CANCELLED,
        self::STATUS_EXPIRED,
    ];

    protected $fillable = [
        'ticket_order_item_id',
        'gifter_id',
        'recipient_email',
        'recipient_name',
        'recipient_user_id',
        'status',
        'gift_token',
        'message',
        'gifted_at',
        'redeemed_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'gifted_at' => 'datetime',
            'redeemed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function ticketOrderItem(): BelongsTo
    {
        return $this->belongsTo(TicketOrderItem::class);
    }

    public function gifter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'gifter_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeForGifter($query, string $userId)
    {
        return $query->where('gifter_id', $userId);
    }

    public function scopeForRecipient($query, string $email)
    {
        return $query->where('recipient_email', $email);
    }

    public function redeem(string $userId): void
    {
        $this->update([
            'status' => self::STATUS_REDEEMED,
            'recipient_user_id' => $userId,
            'redeemed_at' => now(),
        ]);
    }
}


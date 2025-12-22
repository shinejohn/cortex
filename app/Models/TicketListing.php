<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TicketListing extends Model
{
    /** @use HasFactory<\Database\Factories\TicketListingFactory> */
    use HasFactory, HasUuid;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_SOLD = 'sold';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_EXPIRED = 'expired';

    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_SOLD,
        self::STATUS_CANCELLED,
        self::STATUS_EXPIRED,
    ];

    protected $fillable = [
        'ticket_order_item_id',
        'seller_id',
        'event_id',
        'price',
        'quantity',
        'status',
        'description',
        'expires_at',
        'sold_at',
        'sold_to',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'quantity' => 'integer',
            'expires_at' => 'datetime',
            'sold_at' => 'datetime',
        ];
    }

    public function ticketOrderItem(): BelongsTo
    {
        return $this->belongsTo(TicketOrderItem::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sold_to');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeForEvent($query, string $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    public function markAsSold(string $buyerId): void
    {
        $this->update([
            'status' => self::STATUS_SOLD,
            'sold_at' => now(),
            'sold_to' => $buyerId,
        ]);
    }
}


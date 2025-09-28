<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class TicketOrder extends Model
{
    /** @use HasFactory<\Database\Factories\TicketOrderFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'event_id',
        'user_id',
        'status',
        'subtotal',
        'fees',
        'discount',
        'total',
        'promo_code',
        'billing_info',
        'payment_intent_id',
        'payment_status',
        'completed_at',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TicketOrderItem::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForEvent($query, string $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    public function getIsFreeOrderAttribute(): bool
    {
        return $this->total === 0;
    }

    public function getFormattedTotalAttribute(): string
    {
        return '$'.number_format($this->total, 2);
    }

    public function getTotalQuantityAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'fees' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
            'promo_code' => 'array',
            'billing_info' => 'array',
            'completed_at' => 'datetime',
        ];
    }
}

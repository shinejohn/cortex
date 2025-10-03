<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Order extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'order_number',
        'store_id',
        'user_id',
        'customer_email',
        'customer_name',
        'subtotal',
        'tax',
        'shipping',
        'total',
        'status',
        'payment_status',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'shipping_address',
        'billing_address',
        'notes',
        'paid_at',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isRefunded(): bool
    {
        return $this->payment_status === 'refunded';
    }

    protected static function booted(): void
    {
        self::creating(function (Order $order) {
            if (! $order->order_number) {
                $order->order_number = 'ORD-'.mb_strtoupper(uniqid());
            }
        });
    }

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'shipping' => 'decimal:2',
            'total' => 'decimal:2',
            'shipping_address' => 'array',
            'billing_address' => 'array',
            'paid_at' => 'datetime',
        ];
    }
}

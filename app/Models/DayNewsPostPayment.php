<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class DayNewsPostPayment extends Model
{
    /** @use HasFactory<\Database\Factories\DayNewsPostPaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'post_id',
        'workspace_id',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'amount',
        'currency',
        'status',
        'payment_type',
        'ad_days',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(DayNewsPost::class, 'post_id');
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function markAsPaid(): void
    {
        $this->update(['status' => 'paid']);
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }

    public function getAmountInDollars(): float
    {
        return $this->amount / 100;
    }

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'ad_days' => 'integer',
        ];
    }
}

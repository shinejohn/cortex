<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ClassifiedPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'classified_id',
        'workspace_id',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'amount',
        'currency',
        'status',
        'regions_data',
        'total_days',
    ];

    public function classified(): BelongsTo
    {
        return $this->belongsTo(Classified::class, 'classified_id');
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
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
            'regions_data' => 'array',
            'total_days' => 'integer',
        ];
    }
}


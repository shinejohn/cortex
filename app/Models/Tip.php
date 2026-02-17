<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Tip extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'performer_id',
        'fan_id',
        'event_id',
        'amount_cents',
        'platform_fee_cents',
        'stripe_fee_cents',
        'net_amount_cents',
        'status',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'payment_method_type',
        'fan_message',
        'is_anonymous',
    ];

    public function performer(): BelongsTo
    {
        return $this->belongsTo(Performer::class);
    }

    public function fan(): BelongsTo
    {
        return $this->belongsTo(Fan::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function markAsSucceeded(string $chargeId, int $stripeFee): void
    {
        $this->update([
            'status' => 'succeeded',
            'stripe_charge_id' => $chargeId,
            'stripe_fee_cents' => $stripeFee,
            'net_amount_cents' => $this->amount_cents - $this->platform_fee_cents - $stripeFee,
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }

    public function scopeSucceeded($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    protected function casts(): array
    {
        return [
            'is_anonymous' => 'boolean',
        ];
    }
}

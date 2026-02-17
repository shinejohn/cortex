<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AgentCommission extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'booking_agent_id',
        'agent_client_id',
        'source_type',
        'source_id',
        'gross_amount_cents',
        'commission_rate',
        'commission_amount_cents',
        'status',
        'paid_at',
    ];

    public function bookingAgent(): BelongsTo
    {
        return $this->belongsTo(BookingAgent::class);
    }

    public function agentClient(): BelongsTo
    {
        return $this->belongsTo(AgentClient::class);
    }

    public function markAsPaid(): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    protected function casts(): array
    {
        return [
            'commission_rate' => 'decimal:4',
            'paid_at' => 'datetime',
        ];
    }
}

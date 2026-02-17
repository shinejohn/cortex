<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AgentClient extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'booking_agent_id',
        'user_id',
        'client_type',
        'permissions',
        'status',
        'premium_subscription_id',
        'authorized_at',
        'revoked_at',
    ];

    public function bookingAgent(): BelongsTo
    {
        return $this->belongsTo(BookingAgent::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function authorize(): void
    {
        $this->update([
            'status' => 'active',
            'authorized_at' => now(),
            'revoked_at' => null,
        ]);
    }

    public function revoke(): void
    {
        $this->update([
            'status' => 'revoked',
            'revoked_at' => now(),
        ]);
    }

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'authorized_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }
}

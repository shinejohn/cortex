<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

final class PhoneVerification extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'phone_number',
        'code',
        'expires_at',
        'attempts',
        'verified',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'attempts' => 'integer',
        'verified' => 'boolean',
    ];

    /**
     * Scope: Valid (not expired, not verified, attempts < 5)
     */
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', Carbon::now())
            ->where('verified', false)
            ->where('attempts', '<', 5);
    }

    /**
     * Scope: For specific phone number
     */
    public function scopeForPhone($query, string $phoneNumber)
    {
        return $query->where('phone_number', $phoneNumber);
    }

    /**
     * Check if verification is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Increment attempts
     */
    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }
}

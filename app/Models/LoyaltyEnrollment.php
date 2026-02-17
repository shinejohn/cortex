<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class LoyaltyEnrollment extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'loyalty_program_id',
        'business_id',
        'points_balance',
        'current_tier',
        'visits_count',
        'total_spent',
        'enrolled_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function loyaltyProgram(): BelongsTo
    {
        return $this->belongsTo(LoyaltyProgram::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    protected function casts(): array
    {
        return [
            'enrolled_at' => 'datetime',
            'total_spent' => 'decimal:2',
        ];
    }
}

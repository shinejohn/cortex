<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class LoyaltyProgram extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'business_id',
        'name',
        'description',
        'program_type',
        'points_per_dollar',
        'tiers',
        'rewards_catalog',
        'is_active',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(LoyaltyEnrollment::class);
    }

    protected function casts(): array
    {
        return [
            'tiers' => 'array',
            'rewards_catalog' => 'array',
            'is_active' => 'boolean',
            'points_per_dollar' => 'decimal:2',
        ];
    }
}

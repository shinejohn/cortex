<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Challenge extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'challenge_type',
        'requirements',
        'rewards',
        'start_date',
        'end_date',
        'participant_limit',
        'current_participants',
        'business_id',
        'is_active',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function participations(): HasMany
    {
        return $this->hasMany(ChallengeParticipation::class);
    }

    protected function casts(): array
    {
        return [
            'requirements' => 'array',
            'rewards' => 'array',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}

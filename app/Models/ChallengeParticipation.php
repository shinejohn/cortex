<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ChallengeParticipation extends Model
{
    use HasFactory, HasUuid;

    public $timestamps = false; // migration didn't specify timestamps() macro, just joined_at

    protected $fillable = [
        'challenge_id',
        'user_id',
        'progress',
        'completed_at',
        'rewards_claimed',
        'joined_at',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function boot()
    {
        parent::boot();

        self::creating(function ($model) {
            if (empty($model->joined_at)) {
                $model->joined_at = $model->freshTimestamp();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'progress' => 'array',
            'completed_at' => 'datetime',
            'joined_at' => 'datetime',
            'rewards_claimed' => 'boolean',
        ];
    }
}

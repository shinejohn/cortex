<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class UserSegmentMembership extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_segment_id',
        'user_id',
        'assigned_at',
        'expires_at',
    ];

    public function segment(): BelongsTo
    {
        return $this->belongsTo(UserSegment::class, 'user_segment_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param  Builder<UserSegmentMembership>  $query
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now());
        });
    }

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }
}

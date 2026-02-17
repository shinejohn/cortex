<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class UserSegment extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'segment_type',
        'criteria',
        'member_count',
    ];

    public function memberships(): HasMany
    {
        return $this->hasMany(UserSegmentMembership::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_segment_memberships')
            ->withPivot(['assigned_at', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * @param  Builder<UserSegment>  $query
     */
    public function scopeAuto(Builder $query): Builder
    {
        return $query->where('segment_type', 'auto');
    }

    /**
     * @param  Builder<UserSegment>  $query
     */
    public function scopeManual(Builder $query): Builder
    {
        return $query->where('segment_type', 'manual');
    }

    protected function casts(): array
    {
        return [
            'criteria' => 'array',
        ];
    }
}

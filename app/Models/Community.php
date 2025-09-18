<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Community extends Model
{
    /** @use HasFactory<\Database\Factories\CommunityFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'image',
        'categories',
        'thread_types',
        'popular_tags',
        'guidelines',
        'total_events',
        'is_active',
        'is_featured',
        'last_activity',
        'workspace_id',
        'created_by',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function threads(): HasMany
    {
        return $this->hasMany(CommunityThread::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(CommunityMember::class);
    }

    public function activeMembers(): HasMany
    {
        return $this->hasMany(CommunityMember::class)->active();
    }

    // Computed attributes
    public function getMemberCountAttribute(): int
    {
        return $this->activeMembers()->count();
    }

    public function getActiveTodayAttribute(): int
    {
        return $this->activeMembers()->recentlyActive(1)->count();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    protected function casts(): array
    {
        return [
            'categories' => 'array',
            'thread_types' => 'array',
            'popular_tags' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'last_activity' => 'datetime',
        ];
    }
}

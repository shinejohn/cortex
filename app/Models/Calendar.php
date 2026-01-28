<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

final class Calendar extends Model
{
    /** @use HasFactory<\Database\Factories\CalendarFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'image',
        'about',
        'location',
        'update_frequency',
        'subscription_price',
        'is_private',
        'is_verified',
        'followers_count',
        'events_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'calendar_followers')
            ->withTimestamps();
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'calendar_events')
            ->withPivot(['added_by', 'position'])
            ->withTimestamps()
            ->orderBy('calendar_events.position');
    }

    public function roles(): HasMany
    {
        return $this->hasMany(CalendarRole::class);
    }

    public function editors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'calendar_roles')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function follows(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
    }

    public function scopePublic($query)
    {
        return $query->where('is_private', false);
    }

    public function scopePrivate($query)
    {
        return $query->where('is_private', true);
    }

    public function scopeFree($query)
    {
        return $query->where('subscription_price', 0);
    }

    public function scopePaid($query)
    {
        return $query->where('subscription_price', '>', 0);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    protected function casts(): array
    {
        return [
            'subscription_price' => 'decimal:2',
            'is_private' => 'boolean',
            'is_verified' => 'boolean',
            'followers_count' => 'integer',
            'events_count' => 'integer',
        ];
    }
}

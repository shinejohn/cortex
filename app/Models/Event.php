<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Event extends Model
{
    /** @use HasFactory<\Database\Factories\EventFactory> */
    use HasFactory, HasUuid;

    protected $appends = [
        'date',
        'venue_info',
        'price',
        'location',
        'venue_model',
    ];

    protected $fillable = [
        'title',
        'image',
        'event_date',
        'time',
        'description',
        'badges',
        'subcategories',
        'category',
        'is_free',
        'price_min',
        'price_max',
        'community_rating',
        'member_attendance',
        'member_recommendations',
        'discussion_thread_id',
        'curator_notes',
        'latitude',
        'longitude',
        'venue_id',
        'performer_id',
        'workspace_id',
        'created_by',
        'status',
    ];

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(Performer::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function ticketPlans(): HasMany
    {
        return $this->hasMany(TicketPlan::class);
    }

    public function ticketOrders(): HasMany
    {
        return $this->hasMany(TicketOrder::class);
    }

    // Computed attributes for frontend compatibility
    public function getDateAttribute(): string
    {
        return $this->event_date->toISOString();
    }

    public function getVenueInfoAttribute(): array
    {
        if ($this->venue) {
            return [
                'name' => $this->venue->name,
                'city' => $this->venue->neighborhood ?? 'Unknown',
            ];
        }

        return [
            'name' => 'TBD',
            'city' => 'TBD',
        ];
    }

    public function getPriceAttribute(): array
    {
        return [
            'isFree' => $this->is_free,
            'min' => $this->price_min,
            'max' => $this->price_max,
        ];
    }

    public function getLocationAttribute(): array
    {
        return [
            'lat' => $this->latitude,
            'lng' => $this->longitude,
        ];
    }

    public function getVenueModelAttribute(): ?Venue
    {
        return $this->venue;
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now());
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeWithBadge($query, string $badge)
    {
        return $query->whereJsonContains('badges', $badge);
    }

    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    public function scopeWithinPriceRange($query, float $min, float $max)
    {
        return $query->where(function ($q) use ($min, $max) {
            $q->where('is_free', true)
                ->orWhere(function ($q2) use ($min, $max) {
                    $q2->where('price_min', '>=', $min)
                        ->where('price_max', '<=', $max);
                });
        });
    }

    public function scopeWithinRadius($query, float $lat, float $lng, float $radius)
    {
        // Haversine formula for distance calculation
        return $query->selectRaw('
            *,
            (6371 * acos(cos(radians(?))
            * cos(radians(latitude))
            * cos(radians(longitude) - radians(?))
            + sin(radians(?))
            * sin(radians(latitude)))) AS distance
        ', [$lat, $lng, $lat])
            ->whereRaw('
            (6371 * acos(cos(radians(?))
            * cos(radians(latitude))
            * cos(radians(longitude) - radians(?))
            + sin(radians(?))
            * sin(radians(latitude)))) < ?
        ', [$lat, $lng, $lat, $radius]);
    }

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'badges' => 'array',
            'subcategories' => 'array',
            'is_free' => 'boolean',
            'price_min' => 'decimal:2',
            'price_max' => 'decimal:2',
            'community_rating' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }
}

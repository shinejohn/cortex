<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use App\Traits\HasReviewsAndRatings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

final class Venue extends Model
{
    /** @use HasFactory<\Database\Factories\VenueFactory> */
    use HasFactory, HasReviewsAndRatings, HasUuid;

    protected $fillable = [
        'name',
        'description',
        'images',
        'verified',
        'venue_type',
        'capacity',
        'price_per_hour',
        'price_per_event',
        'price_per_day',
        'rating',
        'review_count',
        'address',
        'neighborhood',
        'latitude',
        'longitude',
        'amenities',
        'event_types',
        'unavailable_dates',
        'last_booked_days_ago',
        'response_time_hours',
        'listed_date',
        'status',
        'workspace_id',
        'created_by',
        'average_rating',
        'total_reviews',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function follows(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
    }

    // Computed attributes for frontend compatibility
    public function getLocationAttribute(): array
    {
        return [
            'address' => $this->address,
            'neighborhood' => $this->neighborhood,
            'coordinates' => [
                'lat' => $this->latitude,
                'lng' => $this->longitude,
            ],
        ];
    }

    public function getPricingAttribute(): array
    {
        return [
            'pricePerHour' => $this->price_per_hour,
            'pricePerEvent' => $this->price_per_event,
            'pricePerDay' => $this->price_per_day,
        ];
    }

    public function getDistanceAttribute(): float
    {
        // This would be calculated based on user's location
        // For now, return a default value
        return 0.0;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVerified($query)
    {
        return $query->where('verified', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('venue_type', $type);
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
            'images' => 'array',
            'verified' => 'boolean',
            'price_per_hour' => 'decimal:2',
            'price_per_event' => 'decimal:2',
            'price_per_day' => 'decimal:2',
            'average_rating' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'amenities' => 'array',
            'event_types' => 'array',
            'unavailable_dates' => 'array',
            'listed_date' => 'date',
        ];
    }
}

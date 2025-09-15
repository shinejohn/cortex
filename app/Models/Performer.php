<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use App\Traits\HasReviewsAndRatings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Performer extends Model
{
    /** @use HasFactory<\Database\Factories\PerformerFactory> */
    use HasFactory, HasReviewsAndRatings, HasUuid;

    protected $fillable = [
        'name',
        'profile_image',
        'genres',
        'rating',
        'review_count',
        'follower_count',
        'bio',
        'years_active',
        'shows_played',
        'home_city',
        'is_verified',
        'is_touring_now',
        'available_for_booking',
        'has_merchandise',
        'has_original_music',
        'offers_meet_and_greet',
        'takes_requests',
        'available_for_private_events',
        'is_family_friendly',
        'has_samples',
        'trending_score',
        'distance_miles',
        'added_date',
        'introductory_pricing',
        'base_price',
        'currency',
        'minimum_booking_hours',
        'travel_fee_per_mile',
        'setup_fee',
        'cancellation_policy',
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

    public function upcomingShows(): HasMany
    {
        return $this->hasMany(UpcomingShow::class);
    }

    // Computed attributes for frontend compatibility
    public function getImageAttribute(): ?string
    {
        return $this->profile_image;
    }

    public function getUpcomingShowAttribute(): ?array
    {
        $nextShow = $this->upcomingShows()->upcoming()->first();

        if (! $nextShow) {
            return null;
        }

        return [
            'date' => $nextShow->date->format('Y-m-d'),
            'venue' => $nextShow->venue,
            'ticketsAvailable' => $nextShow->tickets_available,
        ];
    }

    public function getDistanceMilesAttribute(): float
    {
        // This would be calculated based on user's location
        // For now, return a default value
        return $this->attributes['distance_miles'] ?? 0.0;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeAvailableForBooking($query)
    {
        return $query->where('available_for_booking', true);
    }

    public function scopeByGenre($query, string $genre)
    {
        return $query->whereJsonContains('genres', $genre);
    }

    public function scopeFamilyFriendly($query)
    {
        return $query->where('is_family_friendly', true);
    }

    public function scopeTrending($query)
    {
        return $query->orderBy('trending_score', 'desc');
    }

    public function scopeWithinRadius($query, float $lat, float $lng, float $radius)
    {
        // This would need to be implemented based on performer's location
        // For now, return all performers
        return $query;
    }

    protected function casts(): array
    {
        return [
            'genres' => 'array',
            'average_rating' => 'decimal:2',
            'is_verified' => 'boolean',
            'is_touring_now' => 'boolean',
            'available_for_booking' => 'boolean',
            'has_merchandise' => 'boolean',
            'has_original_music' => 'boolean',
            'offers_meet_and_greet' => 'boolean',
            'takes_requests' => 'boolean',
            'available_for_private_events' => 'boolean',
            'is_family_friendly' => 'boolean',
            'has_samples' => 'boolean',
            'distance_miles' => 'decimal:2',
            'added_date' => 'date',
            'introductory_pricing' => 'boolean',
            'base_price' => 'decimal:2',
            'travel_fee_per_mile' => 'decimal:2',
            'setup_fee' => 'decimal:2',
        ];
    }
}

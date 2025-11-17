<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

final class Business extends Model
{
    /** @use HasFactory<\Database\Factories\BusinessFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'google_place_id',
        'name',
        'slug',
        'description',
        'website',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'categories',
        'rating',
        'reviews_count',
        'opening_hours',
        'images',
        'serp_metadata',
        // SERP API: Multiple identifiers
        'data_id',
        'data_cid',
        'lsig',
        'provider_id',
        'local_services_cid',
        'local_services_bid',
        'local_services_pid',
        // SERP API: Source tracking
        'serp_source',
        'serp_last_synced_at',
        // SERP API: Business type
        'primary_type',
        'type_id',
        'type_ids',
        // SERP API: Pricing and hours
        'price_level',
        'open_state',
        'hours_display',
        // SERP API: Local Services
        'google_badge',
        'service_area',
        'years_in_business',
        'bookings_nearby',
        // SERP API: Enhanced verification
        'verification_status',
        'verified_at',
        'claimed_at',
        'is_verified', // Backward compatibility
        // SERP API: Service options and URLs
        'service_options',
        'reserve_url',
        'order_online_url',
        'status',
        'claimable_type',
        'claimable_id',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class)->withTimestamps();
    }

    public function claimable(): MorphTo
    {
        return $this->morphTo();
    }

    public function rssFeeds(): HasMany
    {
        return $this->hasMany(RssFeed::class);
    }

    public function healthyRssFeeds(): HasMany
    {
        return $this->hasMany(RssFeed::class)
            ->where('health_status', 'healthy')
            ->where('status', 'active');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeClaimed($query)
    {
        return $query->whereNotNull('workspace_id');
    }

    public function scopeUnclaimed($query)
    {
        return $query->whereNull('workspace_id');
    }

    public function scopeInRegion($query, string $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('regions.id', $regionId);
        });
    }

    public function scopeWithHealthyFeeds($query)
    {
        return $query->whereHas('rssFeeds', function ($q) {
            $q->where('health_status', 'healthy')
                ->where('status', 'active');
        });
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->whereJsonContains('categories', $category);
    }

    public function scopeWithinRadius($query, float $lat, float $lng, float $radius)
    {
        // Haversine formula for distance calculation (in kilometers)
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

    // Helper methods
    public function isClaimed(): bool
    {
        return $this->workspace_id !== null;
    }

    public function isVerified(): bool
    {
        return $this->is_verified === true;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function hasHealthyFeeds(): bool
    {
        return $this->healthyRssFeeds()->exists();
    }

    public function getLocationAttribute(): array
    {
        return [
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'coordinates' => [
                'lat' => $this->latitude,
                'lng' => $this->longitude,
            ],
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        self::creating(function (Business $business) {
            if (empty($business->slug)) {
                $business->slug = Str::slug($business->name);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'categories' => 'array',
            'opening_hours' => 'array',
            'images' => 'array',
            'serp_metadata' => 'array',
            'type_ids' => 'array',
            'service_area' => 'array',
            'service_options' => 'array',
            'is_verified' => 'boolean',
            'rating' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'reviews_count' => 'integer',
            'years_in_business' => 'integer',
            'bookings_nearby' => 'integer',
            'serp_last_synced_at' => 'datetime',
            'verified_at' => 'datetime',
            'claimed_at' => 'datetime',
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
        // Organization fields
        'organization_type',
        'organization_level',
        'parent_organization_id',
        'organization_category',
        'is_organization',
        'organization_identifier',
        'organization_hierarchy',
        // AlphaSite fields
        'alphasite_subdomain',
        'template_id',
        'ai_services_enabled',
        'premium_enrolled_at',
        'premium_expires_at',
        'subscription_tier',
        'homepage_content',
        'social_links',
        'amenities',
        'featured',
        'promoted',
        'seo_metadata',
        'industry_id',
        'city_id',
        'category_id',
        'smb_business_id',
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

    // Organization relationships
    public function parentOrganization(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_organization_id');
    }

    public function childOrganizations(): HasMany
    {
        return $this->hasMany(self::class, 'parent_organization_id');
    }

    public function organizationRelationships(): HasMany
    {
        return $this->hasMany(OrganizationRelationship::class, 'organization_id');
    }

    public function relatedContent(?string $type = null): HasMany
    {
        $query = $this->hasMany(OrganizationRelationship::class, 'organization_id');
        if ($type) {
            $query->where('relatable_type', $type);
        }

        return $query;
    }

    public function smbBusiness(): BelongsTo
    {
        return $this->belongsTo(SmbBusiness::class, 'smb_business_id');
    }

    // AlphaSite relationships
    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(BusinessTemplate::class, 'template_id');
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(BusinessSubscription::class);
    }

    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class);
    }

    public function featuredAchievements(): HasMany
    {
        return $this->hasMany(Achievement::class)->where('is_featured', true);
    }

    public function faqs(): HasMany
    {
        return $this->hasMany(BusinessFaq::class);
    }

    public function activeFaqs(): HasMany
    {
        return $this->hasMany(BusinessFaq::class)->where('is_active', true);
    }

    public function surveys(): HasMany
    {
        return $this->hasMany(BusinessSurvey::class);
    }

    public function activeSurveys(): HasMany
    {
        return $this->hasMany(BusinessSurvey::class)->where('is_active', true);
    }

    public function crmCustomers(): HasMany
    {
        return $this->hasMany(SMBCrmCustomer::class);
    }

    public function crmInteractions(): HasMany
    {
        return $this->hasMany(SMBCrmInteraction::class);
    }

    public function reviews(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function ratings(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Rating::class, 'ratable');
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class);
    }

    public function customDomain(): HasOne
    {
        return $this->hasOne(CustomDomain::class);
    }

    // Domain Convenience Service relationships
    public function domains(): HasMany
    {
        return $this->hasMany(BusinessDomain::class);
    }

    public function primaryDomain(): HasOne
    {
        return $this->hasOne(BusinessDomain::class)->where('is_primary', true);
    }

    public function activeDomainUrl(): ?string
    {
        $domain = $this->primaryDomain;
        if ($domain && $domain->isActive()) {
            return 'https://'.$domain->domain_name;
        }

        return null;
    }

    public function localVoices(): HasMany
    {
        return $this->hasMany(LocalVoice::class);
    }

    public function photoContributions(): HasMany
    {
        return $this->hasMany(PhotoContribution::class);
    }

    // Community Linking relationships
    public function cityRecord(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function alphasiteCategory(): BelongsTo
    {
        return $this->belongsTo(AlphasiteCategory::class, 'category_id');
    }

    public function serviceAreas(): HasMany
    {
        return $this->hasMany(BusinessServiceArea::class);
    }

    public function activeServiceAreas(): HasMany
    {
        return $this->serviceAreas()->where('status', 'active');
    }

    /**
     * Get all city IDs where this business should appear in listings.
     * Includes home city + active service area cities + cities within active county areas.
     */
    public function getAllServiceCityIds(): array
    {
        $cityIds = [];

        if ($this->city_id) {
            $cityIds[] = $this->city_id;
        }

        $directCities = $this->activeServiceAreas()
            ->where('area_type', BusinessServiceArea::AREA_TYPE_CITY)
            ->whereNotNull('city_id')
            ->pluck('city_id')
            ->toArray();
        $cityIds = array_merge($cityIds, $directCities);

        $countyIds = $this->activeServiceAreas()
            ->where('area_type', BusinessServiceArea::AREA_TYPE_COUNTY)
            ->whereNotNull('county_id')
            ->pluck('county_id');

        if ($countyIds->isNotEmpty()) {
            $countyCities = City::whereIn('county_id', $countyIds)
                ->where('is_active', true)
                ->pluck('id')
                ->toArray();
            $cityIds = array_merge($cityIds, $countyCities);
        }

        return array_unique($cityIds);
    }

    public function servesCity(string $cityId): bool
    {
        return in_array($cityId, $this->getAllServiceCityIds());
    }

    public function getAllServiceCountyIds(): array
    {
        $countyIds = [];

        if ($this->cityRecord && $this->cityRecord->county_id) {
            $countyIds[] = $this->cityRecord->county_id;
        }

        $explicitCounties = $this->activeServiceAreas()
            ->where('area_type', BusinessServiceArea::AREA_TYPE_COUNTY)
            ->whereNotNull('county_id')
            ->pluck('county_id')
            ->toArray();

        return array_unique(array_merge($countyIds, $explicitCounties));
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

    // Organization scopes
    public function scopeOrganizations($query)
    {
        return $query->where('is_organization', true);
    }

    public function scopeByOrganizationType($query, string $type)
    {
        return $query->where('organization_type', $type);
    }

    public function scopeByOrganizationLevel($query, string $level)
    {
        return $query->where('organization_level', $level);
    }

    public function scopeGovernment($query)
    {
        return $query->where('organization_type', 'government');
    }

    public function scopeNational($query)
    {
        return $query->where(function ($q) {
            $q->where('organization_level', 'national')
                ->orWhere('organization_level', 'international');
        });
    }

    public function scopeLocal($query)
    {
        return $query->where('organization_level', 'local');
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
            'is_organization' => 'boolean',
            'organization_hierarchy' => 'array',
            // AlphaSite casts
            'ai_services_enabled' => 'boolean',
            'premium_enrolled_at' => 'datetime',
            'premium_expires_at' => 'datetime',
            'homepage_content' => 'array',
            'social_links' => 'array',
            'amenities' => 'array',
            'featured' => 'boolean',
            'promoted' => 'boolean',
            'seo_metadata' => 'array',
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

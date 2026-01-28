<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NewsSource extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'community_id', 'region_id', 'name', 'source_type', 'subtype', 'description',
        'website_url', 'rss_url', 'business_id', 'is_potential_customer', 'customer_status',
        'platform', 'platform_config', 'default_poll_interval_minutes', 'default_processing_tier',
        'priority', 'is_authoritative', 'is_active', 'is_verified', 'last_successful_collection',
        'consecutive_failures', 'health_score', 'contact_email', 'metadata',
    ];

    protected $casts = [
        'platform_config' => 'array', 'metadata' => 'array',
        'is_active' => 'boolean', 'is_verified' => 'boolean',
        'is_potential_customer' => 'boolean', 'is_authoritative' => 'boolean',
        'last_successful_collection' => 'datetime',
    ];

    public const TYPE_GOVERNMENT = 'government';
    public const TYPE_LAW_ENFORCEMENT = 'law_enforcement';
    public const TYPE_EDUCATION = 'education';
    public const TYPE_BUSINESS = 'business';
    public const TYPE_VENUE = 'venue';
    public const TYPE_MEDIA = 'media';

    public const SUBTYPE_CITY = 'city';
    public const SUBTYPE_COUNTY = 'county';
    public const SUBTYPE_POLICE = 'police';
    public const SUBTYPE_SHERIFF = 'sheriff';
    public const SUBTYPE_SCHOOL_DISTRICT = 'school_district';

    public const PLATFORM_CIVICPLUS = 'civicplus';
    public const PLATFORM_GRANICUS = 'granicus';
    public const PLATFORM_NIXLE = 'nixle';

    public function community() { return $this->belongsTo(Community::class); }
    public function region() { return $this->belongsTo(Region::class); }
    public function collectionMethods() { return $this->hasMany(CollectionMethod::class, 'source_id'); }
    public function rawContent() { return $this->hasMany(RawContent::class, 'source_id'); }

    public function scopeActive($q) { return $q->where('is_active', true); }
    public function scopeByType($q, $t) { return $q->where('source_type', $t); }

    public function recordSuccess(): void {
        $this->update([
            'last_successful_collection' => now(),
            'consecutive_failures' => 0,
            'health_score' => min(100, $this->health_score + 5),
        ]);
    }

    public function recordFailure(string $error = null): void {
        $this->update([
            'consecutive_failures' => $this->consecutive_failures + 1,
            'health_score' => max(0, $this->health_score - 10),
        ]);
        if ($this->consecutive_failures >= 10) $this->update(['is_active' => false]);
    }
}

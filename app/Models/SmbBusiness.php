<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class SmbBusiness extends Model
{
    /** @use HasFactory<\Database\Factories\SmbBusinessFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $table = 'smb_businesses';

    protected $fillable = [
        'tenant_id',
        'google_place_id',
        'display_name',
        'latitude',
        'longitude',
        'formatted_address',
        'address_components',
        'plus_code',
        'viewport',
        'location',
        'phone_national',
        'phone_international',
        'website_url',
        'business_status',
        'fibonacco_status',
        'google_rating',
        'google_rating_count',
        'user_rating_total',
        'delivery',
        'dine_in',
        'takeout',
        'reservable',
        'outdoor_seating',
        'serves_breakfast',
        'serves_lunch',
        'serves_dinner',
        'serves_beer',
        'serves_wine',
        'serves_brunch',
        'serves_vegetarian_food',
        'wheelchair_accessible_entrance',
        'place_types',
        'accessibility_options',
        'payment_options',
        'parking_options',
        'data_sources',
        'opening_hours',
        'current_opening_hours',
        'secondary_opening_hours',
        'editorial_summary',
        'photos',
        'reviews',
        'utc_offset',
        'adr_address',
        'formatted_phone_number',
        'international_phone_number',
        'price_level',
        'icon',
        'icon_background_color',
        'icon_mask_base_uri',
        'name',
        'place_id',
        'reference',
        'scope',
        'types',
        'url',
        'vicinity',
        'geometry',
        'permanently_closed',
        'permanently_closed_time',
        'last_google_sync_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'google_rating' => 'decimal:1',
            'address_components' => 'array',
            'viewport' => 'array',
            'location' => 'array',
            'place_types' => 'array',
            'accessibility_options' => 'array',
            'payment_options' => 'array',
            'parking_options' => 'array',
            'data_sources' => 'array',
            'opening_hours' => 'array',
            'current_opening_hours' => 'array',
            'secondary_opening_hours' => 'array',
            'editorial_summary' => 'array',
            'photos' => 'array',
            'reviews' => 'array',
            'types' => 'array',
            'geometry' => 'array',
            'delivery' => 'boolean',
            'dine_in' => 'boolean',
            'takeout' => 'boolean',
            'reservable' => 'boolean',
            'outdoor_seating' => 'boolean',
            'serves_breakfast' => 'boolean',
            'serves_lunch' => 'boolean',
            'serves_dinner' => 'boolean',
            'serves_beer' => 'boolean',
            'serves_wine' => 'boolean',
            'serves_brunch' => 'boolean',
            'serves_vegetarian_food' => 'boolean',
            'wheelchair_accessible_entrance' => 'boolean',
            'permanently_closed' => 'boolean',
            'permanently_closed_time' => 'datetime',
            'last_google_sync_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'smb_business_id');
    }

    public function businessHours(): HasMany
    {
        return $this->hasMany(BusinessHours::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(BusinessPhoto::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(BusinessReview::class);
    }

    public function attributes(): HasMany
    {
        return $this->hasMany(BusinessAttribute::class);
    }
}

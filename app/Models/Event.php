<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

final class Event extends Model
{
    /** @use HasFactory<\Database\Factories\EventFactory> */
    use \App\Traits\RelatableToOrganizations, HasFactory, HasUuid;

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
        'image_path',
        'image_disk',
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
        'google_place_id',
        'postal_code',
        'venue_id',
        'performer_id',
        'workspace_id',
        'created_by',
        'source_news_article_id',
        'source_type',
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

    public function sourceNewsArticle(): BelongsTo
    {
        return $this->belongsTo(NewsArticle::class, 'source_news_article_id');
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'event_region')
            ->withTimestamps();
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

    public function hub(): BelongsTo
    {
        return $this->belongsTo(Hub::class);
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class);
    }

    public function plannedEvents(): HasMany
    {
        return $this->hasMany(PlannedEvent::class);
    }

    public function follows(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
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

    public function getImageAttribute(): ?string
    {
        // Priority: local storage > original URL > null
        if ($this->image_path && $this->image_disk) {
            return \Illuminate\Support\Facades\Storage::disk($this->image_disk)->url($this->image_path);
        }

        return $this->attributes['image'] ?? null;
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

    public function scopeAiExtracted($query)
    {
        return $query->where('source_type', 'ai_extracted');
    }

    public function scopeManual($query)
    {
        return $query->where('source_type', 'manual');
    }

    public function scopeWithinPriceRange($query, float $min, float $max)
    {
        return $query->where(function ($q) use ($min, $max) {
            $q->where('is_free', true)
                ->orWhere(function ($q2) use ($min, $max) {
                    $q2->where('price_min', '<=', $max)
                        ->where('price_max', '>=', $min);
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

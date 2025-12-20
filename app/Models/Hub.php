<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

final class Hub extends Model
{
    /** @use HasFactory<\Database\Factories\HubFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'workspace_id',
        'created_by',
        'name',
        'slug',
        'description',
        'image',
        'banner_image',
        'about',
        'category',
        'subcategory',
        'location',
        'website',
        'social_links',
        'contact_email',
        'contact_phone',
        'is_active',
        'is_featured',
        'is_verified',
        'design_settings',
        'monetization_settings',
        'permissions',
        'analytics_enabled',
        'articles_enabled',
        'community_enabled',
        'events_enabled',
        'gallery_enabled',
        'performers_enabled',
        'venues_enabled',
        'followers_count',
        'events_count',
        'articles_count',
        'members_count',
        'last_activity_at',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'design_settings' => 'array',
            'monetization_settings' => 'array',
            'permissions' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_verified' => 'boolean',
            'analytics_enabled' => 'boolean',
            'articles_enabled' => 'boolean',
            'community_enabled' => 'boolean',
            'events_enabled' => 'boolean',
            'gallery_enabled' => 'boolean',
            'performers_enabled' => 'boolean',
            'venues_enabled' => 'boolean',
            'followers_count' => 'integer',
            'events_count' => 'integer',
            'articles_count' => 'integer',
            'members_count' => 'integer',
            'last_activity_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(HubSection::class)->orderBy('sort_order');
    }

    public function members(): HasMany
    {
        return $this->hasMany(HubMember::class);
    }

    public function roles(): HasMany
    {
        return $this->hasMany(HubRole::class);
    }

    public function analytics(): HasMany
    {
        return $this->hasMany(HubAnalytics::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'hub_id');
    }

    public function follows(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public static function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        return $slug;
    }

    public function getUrlAttribute(): string
    {
        return "/hubs/{$this->slug}";
    }
}


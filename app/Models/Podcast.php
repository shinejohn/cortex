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
use Illuminate\Support\Str;

final class Podcast extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'creator_profile_id',
        'title',
        'slug',
        'description',
        'cover_image',
        'category',
        'status',
        'published_at',
        'episodes_count',
        'subscribers_count',
        'total_listens',
        'total_duration',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(CreatorProfile::class, 'creator_profile_id');
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(PodcastEpisode::class, 'podcast_id')
            ->orderBy('published_at', 'desc');
    }

    public function publishedEpisodes(): HasMany
    {
        return $this->episodes()->where('status', 'published');
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'podcast_region')
            ->withTimestamps();
    }

    public function followers(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('region_id', $regionId);
        });
    }

    public function incrementSubscribersCount(): void
    {
        $this->increment('subscribers_count');
    }

    public function incrementEpisodesCount(): void
    {
        $this->increment('episodes_count');
        $this->creator->incrementEpisodesCount();
    }

    public function incrementTotalListens(): void
    {
        $this->increment('total_listens');
        $this->creator->increment('total_listens');
    }

    protected static function booted(): void
    {
        self::creating(function (Podcast $podcast): void {
            if (empty($podcast->slug)) {
                $podcast->slug = static::generateUniqueSlug($podcast->title);
            }
        });

        self::created(function (Podcast $podcast): void {
            $podcast->creator->incrementPodcastsCount();
        });
    }

    protected static function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        return $slug;
    }

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'episodes_count' => 'integer',
            'subscribers_count' => 'integer',
            'total_listens' => 'integer',
            'total_duration' => 'integer',
        ];
    }
}

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

final class CreatorProfile extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'display_name',
        'slug',
        'bio',
        'avatar',
        'cover_image',
        'social_links',
        'status',
        'followers_count',
        'podcasts_count',
        'episodes_count',
        'total_listens',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function podcasts(): HasMany
    {
        return $this->hasMany(Podcast::class, 'creator_profile_id');
    }

    public function followers(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function incrementFollowersCount(): void
    {
        $this->increment('followers_count');
    }

    public function incrementPodcastsCount(): void
    {
        $this->increment('podcasts_count');
    }

    public function incrementEpisodesCount(): void
    {
        $this->increment('episodes_count');
    }

    protected static function booted(): void
    {
        self::creating(function (CreatorProfile $profile): void {
            if (empty($profile->slug)) {
                $profile->slug = static::generateUniqueSlug($profile->display_name);
            }
        });
    }

    protected static function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'followers_count' => 'integer',
            'podcasts_count' => 'integer',
            'episodes_count' => 'integer',
            'total_listens' => 'integer',
        ];
    }
}


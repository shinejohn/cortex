<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

final class Tag extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'article_count',
        'followers_count',
        'is_trending',
        'trending_score',
    ];

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(DayNewsPost::class, 'day_news_post_tag')
            ->withTimestamps();
    }

    public function followers(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
    }

    // Scopes
    public function scopeTrending($query)
    {
        return $query->where('is_trending', true)
            ->orderBy('trending_score', 'desc');
    }

    public function scopePopular($query)
    {
        return $query->orderBy('article_count', 'desc');
    }

    protected static function booted(): void
    {
        self::creating(function (Tag $tag): void {
            if (empty($tag->slug)) {
                $tag->slug = static::generateUniqueSlug($tag->name);
            }
        });
    }

    protected static function generateUniqueSlug(string $name): string
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

    protected function casts(): array
    {
        return [
            'is_trending' => 'boolean',
            'article_count' => 'integer',
            'followers_count' => 'integer',
            'trending_score' => 'integer',
        ];
    }
}


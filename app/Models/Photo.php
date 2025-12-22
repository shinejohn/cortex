<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use App\Traits\HasReviewsAndRatings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Storage;

final class Photo extends Model
{
    use HasFactory, HasUuid, HasReviewsAndRatings;

    protected $fillable = [
        'user_id',
        'album_id',
        'title',
        'description',
        'image_path',
        'image_disk',
        'thumbnail_path',
        'category',
        'status',
        'width',
        'height',
        'file_size',
        'views_count',
        'likes_count',
        'comments_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(PhotoAlbum::class, 'album_id');
    }

    public function albums(): BelongsToMany
    {
        return $this->belongsToMany(PhotoAlbum::class, 'photo_album_photo')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'photo_region')
            ->withTimestamps();
    }

    // Photos don't use ArticleComment - they would need their own comment system
    // For now, we'll leave this out or create a separate PhotoComment model if needed

    public function getImageUrlAttribute(): string
    {
        return Storage::disk($this->image_disk)->url($this->image_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail_path) {
            return $this->image_url;
        }
        return Storage::disk($this->image_disk)->url($this->thumbnail_path);
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeForRegion($query, int $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('region_id', $regionId);
        });
    }

    public function scopePublic($query)
    {
        return $query->whereHas('album', function ($q) {
            $q->where('visibility', 'public');
        })->orWhereNull('album_id');
    }

    public function incrementViewsCount(): void
    {
        $this->increment('views_count');
    }

    public function incrementLikesCount(): void
    {
        $this->increment('likes_count');
    }

    public function incrementCommentsCount(): void
    {
        $this->increment('comments_count');
    }

    protected function casts(): array
    {
        return [
            'width' => 'integer',
            'height' => 'integer',
            'file_size' => 'integer',
            'views_count' => 'integer',
            'likes_count' => 'integer',
            'comments_count' => 'integer',
        ];
    }
}


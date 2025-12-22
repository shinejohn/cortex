<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class PhotoAlbum extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'workspace_id',
        'title',
        'description',
        'cover_image',
        'visibility',
        'photos_count',
        'views_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function photos(): BelongsToMany
    {
        return $this->belongsToMany(Photo::class, 'photo_album_photo')
            ->withPivot('order')
            ->orderBy('photo_album_photo.order')
            ->withTimestamps();
    }

    // Albums don't directly have regions - photos do
    // Use a helper method to get regions from photos
    public function getRegionsAttribute()
    {
        return Region::whereHas('photos', function ($q) {
            $q->where('album_id', $this->id);
        })->get();
    }

    public function incrementViewsCount(): void
    {
        $this->increment('views_count');
    }

    public function incrementPhotosCount(): void
    {
        $this->increment('photos_count');
    }

    protected function casts(): array
    {
        return [
            'photos_count' => 'integer',
            'views_count' => 'integer',
        ];
    }
}


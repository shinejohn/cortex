<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use App\Traits\HasReviewsAndRatings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

final class Memorial extends Model
{
    use HasFactory, HasReviewsAndRatings, HasUuid;

    protected $fillable = [
        'user_id',
        'workspace_id',
        'name',
        'years',
        'date_of_passing',
        'obituary',
        'image',
        'location',
        'service_date',
        'service_location',
        'service_details',
        'is_featured',
        'status',
        'published_at',
        'views_count',
        'reactions_count',
        'comments_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'memorial_region')
            ->withTimestamps();
    }

    // Memorials can have comments, but they would need their own comment system
    // For now, we'll use the reactions_count field to track engagement
    // TODO: Create MemorialComment model if comments are needed

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('region_id', $regionId);
        });
    }

    public function incrementViewsCount(): void
    {
        $this->increment('views_count');
    }

    public function incrementReactionsCount(): void
    {
        $this->increment('reactions_count');
    }

    public function incrementCommentsCount(): void
    {
        $this->increment('comments_count');
    }

    protected function casts(): array
    {
        return [
            'date_of_passing' => 'date',
            'service_date' => 'date',
            'published_at' => 'datetime',
            'is_featured' => 'boolean',
            'views_count' => 'integer',
            'reactions_count' => 'integer',
            'comments_count' => 'integer',
        ];
    }
}

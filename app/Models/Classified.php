<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class Classified extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'workspace_id',
        'category',
        'subcategory',
        'title',
        'description',
        'price',
        'price_type',
        'condition',
        'location',
        'is_featured',
        'status',
        'posted_at',
        'expires_at',
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

    public function images(): HasMany
    {
        return $this->hasMany(ClassifiedImage::class, 'classified_id')->orderBy('order');
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'classified_region')
            ->withPivot('days')
            ->withTimestamps();
    }

    public function payment(): HasOne
    {
        return $this->hasOne(ClassifiedPayment::class, 'classified_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeForRegion($query, int $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('region_id', $regionId);
        });
    }

    public function incrementViewsCount(): void
    {
        $this->increment('views_count');
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_featured' => 'boolean',
            'posted_at' => 'datetime',
            'expires_at' => 'datetime',
            'views_count' => 'integer',
        ];
    }
}


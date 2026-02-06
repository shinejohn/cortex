<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasComments;
use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

final class Classified extends Model
{
    use HasComments, HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'user_id',
        'classified_category_id',
        'title',
        'slug',
        'description',
        'price',
        'price_type',
        'condition',
        'contact_email',
        'contact_phone',
        'status',
        'view_count',
        'saves_count',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ClassifiedCategory::class, 'classified_category_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ClassifiedImage::class)->orderBy('order');
    }

    public function specificationValues(): HasMany
    {
        return $this->hasMany(ClassifiedSpecificationValue::class);
    }

    public function customAttributes(): HasMany
    {
        return $this->hasMany(ClassifiedCustomAttribute::class);
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'classified_region')->withTimestamps();
    }

    public function saves(): HasMany
    {
        return $this->hasMany(SavedClassified::class);
    }

    // Accessors
    public function getPrimaryImageAttribute(): ?string
    {
        $primary = $this->images->where('is_primary', true)->first();
        if ($primary) {
            return $primary->url;
        }

        $first = $this->images->first();

        return $first?->url;
    }

    public function getPriceDisplayAttribute(): string
    {
        return match ($this->price_type) {
            'free' => 'Free',
            'contact' => 'Contact for Price',
            'negotiable' => $this->price !== null ? '$'.number_format((float) $this->price, 2).' (Negotiable)' : 'Negotiable',
            default => $this->price !== null ? '$'.number_format((float) $this->price, 2) : 'Contact for Price',
        };
    }

    public function getConditionDisplayAttribute(): ?string
    {
        if ($this->condition === null) {
            return null;
        }

        return match ($this->condition) {
            'new' => 'New',
            'like_new' => 'Like New',
            'good' => 'Good',
            'fair' => 'Fair',
            'for_parts' => 'For Parts',
            default => ucfirst($this->condition),
        };
    }

    // Helper methods
    public function isSavedBy(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        return $this->saves()->where('user_id', $user->id)->exists();
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function recalculateSavesCount(): void
    {
        $this->saves_count = $this->saves()->count();
        $this->saveQuietly();
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSold(): bool
    {
        return $this->status === 'sold';
    }

    public function isOwnedBy(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        return $this->user_id === $user->id;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInRegion($query, string $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('regions.id', $regionId);
        });
    }

    public function scopeByCategory($query, string $categoryId)
    {
        return $query->where('classified_category_id', $categoryId);
    }

    public function scopeByCondition($query, string $condition)
    {
        return $query->where('condition', $condition);
    }

    public function scopePriceRange($query, ?float $min, ?float $max)
    {
        if ($min !== null) {
            $query->where('price', '>=', $min);
        }

        if ($max !== null) {
            $query->where('price', '<=', $max);
        }

        return $query;
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    public function scopeOrderByRecent($query)
    {
        return $query->orderByDesc('created_at');
    }

    // Boot method for auto-generating slugs
    protected static function boot(): void
    {
        parent::boot();

        self::creating(function (Classified $classified) {
            if (empty($classified->slug)) {
                $baseSlug = Str::slug($classified->title);
                $slug = $baseSlug;
                $counter = 1;

                while (self::where('slug', $slug)->exists()) {
                    $slug = $baseSlug.'-'.$counter;
                    $counter++;
                }

                $classified->slug = $slug;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'view_count' => 'integer',
            'saves_count' => 'integer',
        ];
    }
}

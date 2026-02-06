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

final class Coupon extends Model
{
    /** @use HasFactory<\Database\Factories\CouponFactory> */
    use HasComments, HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'user_id',
        'business_id',
        'title',
        'slug',
        'code',
        'description',
        'terms_conditions',
        'discount_type',
        'discount_value',
        'valid_from',
        'valid_until',
        'image',
        'status',
        'is_verified',
        'verified_at',
        'verified_by',
        'category',
        'upvotes_count',
        'downvotes_count',
        'score',
        'saves_count',
        'view_count',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'coupon_region')->withTimestamps();
    }

    public function votes(): HasMany
    {
        return $this->hasMany(CouponVote::class);
    }

    public function saves(): HasMany
    {
        return $this->hasMany(SavedCoupon::class);
    }

    // Helper methods
    public function isExpired(): bool
    {
        if ($this->valid_until === null) {
            return false;
        }

        return $this->valid_until->isPast();
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && ! $this->isExpired();
    }

    public function getDiscountDisplayAttribute(): string
    {
        return match ($this->discount_type) {
            'percentage' => $this->discount_value.'% OFF',
            'fixed_amount' => '$'.number_format((float) $this->discount_value, 2).' OFF',
            'buy_one_get_one' => 'BOGO',
            'free_item' => 'FREE ITEM',
            default => 'DEAL',
        };
    }

    public function recalculateScore(): void
    {
        $this->upvotes_count = $this->votes()->where('vote_type', 'up')->count();
        $this->downvotes_count = $this->votes()->where('vote_type', 'down')->count();
        $this->score = $this->upvotes_count - $this->downvotes_count;
        $this->saves_count = $this->saves()->count();
        $this->saveQuietly();
    }

    public function isUpvotedBy(User $user): bool
    {
        return $this->votes()->where('user_id', $user->id)->where('vote_type', 'up')->exists();
    }

    public function isDownvotedBy(User $user): bool
    {
        return $this->votes()->where('user_id', $user->id)->where('vote_type', 'down')->exists();
    }

    public function getUserVote(User $user): ?string
    {
        $vote = $this->votes()->where('user_id', $user->id)->first();

        return $vote?->vote_type;
    }

    public function isSavedBy(User $user): bool
    {
        return $this->saves()->where('user_id', $user->id)->exists();
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeFeatured($query)
    {
        return $query->active()
            ->notExpired()
            ->where(function ($q) {
                $q->where('is_verified', true)
                    ->orWhere('score', '>=', 5);
            })
            ->orderByDesc('is_verified')
            ->orderByDesc('score');
    }

    public function scopeInRegion($query, string $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('regions.id', $regionId);
        });
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByBusiness($query, string $businessId)
    {
        return $query->where('business_id', $businessId);
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('valid_until')
                ->orWhere('valid_until', '>=', now()->toDateString());
        });
    }

    public function scopeOrderByScore($query)
    {
        return $query->orderByDesc('score');
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhereHas('business', function ($bq) use ($search) {
                    $bq->where('name', 'like', "%{$search}%");
                });
        });
    }

    protected static function boot(): void
    {
        parent::boot();

        self::creating(function (Coupon $coupon) {
            if (empty($coupon->slug)) {
                $baseSlug = Str::slug($coupon->title);
                $slug = $baseSlug;
                $counter = 1;

                while (self::where('slug', $slug)->exists()) {
                    $slug = $baseSlug.'-'.$counter;
                    $counter++;
                }

                $coupon->slug = $slug;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'valid_from' => 'date',
            'valid_until' => 'date',
            'is_verified' => 'boolean',
            'verified_at' => 'datetime',
            'upvotes_count' => 'integer',
            'downvotes_count' => 'integer',
            'score' => 'integer',
            'saves_count' => 'integer',
            'view_count' => 'integer',
        ];
    }
}

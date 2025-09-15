<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\Rating;
use App\Models\Review;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasReviewsAndRatings
{
    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function ratings(): MorphMany
    {
        return $this->morphMany(Rating::class, 'ratable');
    }

    public function approvedReviews(): MorphMany
    {
        return $this->reviews()->approved();
    }

    public function featuredReviews(): MorphMany
    {
        return $this->reviews()->approved()->featured();
    }

    // Calculate and update average rating
    public function updateAverageRating(): void
    {
        $stats = $this->ratings()
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_ratings')
            ->first();

        $reviewStats = $this->reviews()
            ->approved()
            ->selectRaw('COUNT(*) as total_reviews')
            ->first();

        $this->update([
            'average_rating' => round($stats->avg_rating ?? 0, 2),
            'total_reviews' => $reviewStats->total_reviews ?? 0,
        ]);
    }

    // Get average rating by context
    public function getAverageRatingByContext(string $context): float
    {
        return $this->ratings()
            ->byContext($context)
            ->avg('rating') ?? 0;
    }

    // Get rating distribution
    public function getRatingDistribution(): array
    {
        $distribution = $this->ratings()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        // Fill in missing ratings with 0
        for ($i = 1; $i <= 5; $i++) {
            if (! isset($distribution[$i])) {
                $distribution[$i] = 0;
            }
        }

        ksort($distribution);

        return $distribution;
    }

    // Check if user has reviewed this entity
    public function hasUserReviewed(int $userId): bool
    {
        return $this->reviews()
            ->where('user_id', $userId)
            ->exists();
    }

    // Check if user has rated this entity in specific context
    public function hasUserRated(int $userId, ?string $context = null): bool
    {
        $query = $this->ratings()->where('user_id', $userId);

        if ($context) {
            $query->byContext($context);
        }

        return $query->exists();
    }

    // Get user's rating for this entity
    public function getUserRating(int $userId, ?string $context = null): ?Rating
    {
        $query = $this->ratings()->where('user_id', $userId);

        if ($context) {
            $query->byContext($context);
        }

        return $query->first();
    }

    // Get user's review for this entity
    public function getUserReview(int $userId): ?Review
    {
        return $this->reviews()
            ->where('user_id', $userId)
            ->first();
    }

    // Scope for high-rated items
    public function scopeHighlyRated($query, float $minimumRating = 4.0)
    {
        return $query->where('average_rating', '>=', $minimumRating);
    }

    // Scope for items with many reviews
    public function scopeWellReviewed($query, int $minimumReviews = 5)
    {
        return $query->where('total_reviews', '>=', $minimumReviews);
    }
}

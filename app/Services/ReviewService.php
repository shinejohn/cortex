<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Review;
use App\Models\Rating;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class ReviewService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Create a new review
     */
    public function create(Model $reviewable, array $data, int $userId): Review
    {
        DB::beginTransaction();
        
        try {
            // Create review
            $review = Review::create([
                'reviewable_type' => get_class($reviewable),
                'reviewable_id' => $reviewable->id,
                'user_id' => $userId,
                'title' => $data['title'] ?? null,
                'content' => $data['content'],
                'rating' => $data['rating'],
                'status' => $data['status'] ?? 'pending',
            ]);

            // Create rating if provided
            if (isset($data['rating'])) {
                $this->createRating($reviewable, $userId, $data['rating'], $data['context'] ?? null);
            }

            // Update reviewable's rating cache
            $this->updateReviewableRating($reviewable);

            DB::commit();

            // Clear cache
            $this->clearReviewCache($reviewable);

            return $review->fresh(['user']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing review
     */
    public function update(Review $review, array $data): Review
    {
        DB::beginTransaction();
        
        try {
            $review->update($data);

            // Update rating if changed
            if (isset($data['rating'])) {
                $rating = Rating::where('ratable_type', $review->reviewable_type)
                    ->where('ratable_id', $review->reviewable_id)
                    ->where('user_id', $review->user_id)
                    ->first();

                if ($rating) {
                    $rating->update(['rating' => $data['rating']]);
                } else {
                    $this->createRating($review->reviewable, $review->user_id, $data['rating']);
                }

                // Update reviewable's rating cache
                $this->updateReviewableRating($review->reviewable);
            }

            DB::commit();

            // Clear cache
            $this->clearReviewCache($review->reviewable);

            return $review->fresh(['user']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Approve a review
     */
    public function approve(Review $review, ?int $approvedBy = null): Review
    {
        $review->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approvedBy,
        ]);

        // Update reviewable's rating cache
        $this->updateReviewableRating($review->reviewable);

        // Clear cache
        $this->clearReviewCache($review->reviewable);

        return $review->fresh();
    }

    /**
     * Reject a review
     */
    public function reject(Review $review, string $reason, ?int $rejectedBy = null): Review
    {
        $review->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'approved_by' => $rejectedBy,
        ]);

        // Clear cache
        $this->clearReviewCache($review->reviewable);

        return $review->fresh();
    }

    /**
     * Get reviews for a model
     */
    public function getForModel(Model $reviewable, array $filters = [], int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $cacheKey = 'reviews:'.get_class($reviewable).':'.$reviewable->id.':'.md5(serialize([$filters, $perPage]));
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () use ($reviewable, $filters, $perPage) {
            $query = Review::where('reviewable_type', get_class($reviewable))
                ->where('reviewable_id', $reviewable->id)
                ->with(['user']);

            // Filters
            if (isset($filters['status'])) {
                $query->where('status', $filters['status']);
            } else {
                $query->where('status', 'approved');
            }

            if (isset($filters['rating'])) {
                $query->where('rating', $filters['rating']);
            }

            if (isset($filters['is_featured'])) {
                $query->where('is_featured', $filters['is_featured']);
            }

            if (isset($filters['is_verified'])) {
                $query->where('is_verified', $filters['is_verified']);
            }

            // Sorting
            $sortBy = $filters['sort_by'] ?? 'created_at';
            $sortOrder = $filters['sort_order'] ?? 'desc';
            
            if ($sortBy === 'helpful') {
                $query->orderBy('helpful_count', $sortOrder);
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }

            return $query->paginate($perPage);
        });
    }

    /**
     * Get average rating for a model
     */
    public function getAverageRating(Model $reviewable): float
    {
        $cacheKey = 'rating:avg:'.get_class($reviewable).':'.$reviewable->id;
        
        return (float) $this->cacheService->remember($cacheKey, now()->addHours(1), function () use ($reviewable) {
            return Review::where('reviewable_type', get_class($reviewable))
                ->where('reviewable_id', $reviewable->id)
                ->where('status', 'approved')
                ->avg('rating') ?? 0.0;
        });
    }

    /**
     * Get rating distribution for a model
     */
    public function getRatingDistribution(Model $reviewable): array
    {
        $cacheKey = 'rating:distribution:'.get_class($reviewable).':'.$reviewable->id;
        
        return $this->cacheService->remember($cacheKey, now()->addHours(1), function () use ($reviewable) {
            $distribution = Review::where('reviewable_type', get_class($reviewable))
                ->where('reviewable_id', $reviewable->id)
                ->where('status', 'approved')
                ->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->orderBy('rating', 'desc')
                ->pluck('count', 'rating')
                ->toArray();

            // Ensure all ratings 1-5 are present
            $result = [];
            for ($i = 5; $i >= 1; $i--) {
                $result[$i] = $distribution[$i] ?? 0;
            }

            return $result;
        });
    }

    /**
     * Get review count for a model
     */
    public function getReviewCount(Model $reviewable, bool $approvedOnly = true): int
    {
        $cacheKey = 'reviews:count:'.get_class($reviewable).':'.$reviewable->id.':'.($approvedOnly ? 'approved' : 'all');
        
        return (int) $this->cacheService->remember($cacheKey, now()->addHours(1), function () use ($reviewable, $approvedOnly) {
            $query = Review::where('reviewable_type', get_class($reviewable))
                ->where('reviewable_id', $reviewable->id);

            if ($approvedOnly) {
                $query->where('status', 'approved');
            }

            return $query->count();
        });
    }

    /**
     * Mark review as helpful
     */
    public function markAsHelpful(Review $review, int $userId): Review
    {
        // Check if user already marked as helpful (would need a pivot table in production)
        $review->increment('helpful_count');
        $review->increment('helpful_votes');

        // Clear cache
        $this->clearReviewCache($review->reviewable);

        return $review->fresh();
    }

    /**
     * Feature a review
     */
    public function feature(Review $review): Review
    {
        $review->update(['is_featured' => true]);

        // Clear cache
        $this->clearReviewCache($review->reviewable);

        return $review->fresh();
    }

    /**
     * Unfeature a review
     */
    public function unfeature(Review $review): Review
    {
        $review->update(['is_featured' => false]);

        // Clear cache
        $this->clearReviewCache($review->reviewable);

        return $review->fresh();
    }

    /**
     * Create a rating
     */
    private function createRating(Model $ratable, int $userId, float $rating, ?string $context = null): Rating
    {
        return Rating::updateOrCreate(
            [
                'ratable_type' => get_class($ratable),
                'ratable_id' => $ratable->id,
                'user_id' => $userId,
            ],
            [
                'rating' => $rating,
                'context' => $context,
            ]
        );
    }

    /**
     * Update reviewable's rating cache
     */
    private function updateReviewableRating(Model $reviewable): void
    {
        if (method_exists($reviewable, 'updateRating')) {
            $averageRating = $this->getAverageRating($reviewable);
            $reviewCount = $this->getReviewCount($reviewable);

            $reviewable->updateRating($averageRating, $reviewCount);
        } elseif (property_exists($reviewable, 'rating') || $reviewable->getFillable() && in_array('rating', $reviewable->getFillable())) {
            $averageRating = $this->getAverageRating($reviewable);
            $reviewCount = $this->getReviewCount($reviewable);

            $reviewable->update([
                'rating' => $averageRating,
                'reviews_count' => $reviewCount,
            ]);
        }
    }

    /**
     * Clear review-related cache
     */
    private function clearReviewCache(Model $reviewable): void
    {
        $this->cacheService->forget('reviews:'.get_class($reviewable).':'.$reviewable->id.':*');
        $this->cacheService->forget('rating:avg:'.get_class($reviewable).':'.$reviewable->id);
        $this->cacheService->forget('rating:distribution:'.get_class($reviewable).':'.$reviewable->id);
        $this->cacheService->forget('reviews:count:'.get_class($reviewable).':'.$reviewable->id.':*');
    }
}


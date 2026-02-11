<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\Classified;
use App\Models\ClassifiedPayment;
use App\Models\Region;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class ClassifiedService
{
    /**
     * Get featured classifieds
     */
    public function getFeaturedClassifieds(?string $regionId = null, int $limit = 6): Collection
    {
        $query = Classified::active()->featured()->latest();

        if ($regionId) {
            $query->inRegion($regionId);
        }

        return $query->take($limit)->get();
    }

    /**
     * Get classifieds with pagination/filtering
     */
    public function getClassifieds(
        ?string $regionId = null,
        ?string $categoryId = null,
        ?string $condition = null,
        ?float $minPrice = null,
        ?float $maxPrice = null,
        ?string $search = null,
        bool $showGlobal = false,
        int $perPage = 12
    ): LengthAwarePaginator {
        $query = Classified::active()->latest();

        if ($regionId) {
            $query->where(function ($q) use ($regionId, $showGlobal) {
                $q->inRegion($regionId);

                if ($showGlobal) {
                    $q->orWhereDoesntHave('regions');
                }
            });
        }

        if ($categoryId) {
            $query->byCategory($categoryId);
        }

        if ($condition) {
            $query->byCondition($condition);
        }

        if ($minPrice !== null || $maxPrice !== null) {
            $query->priceRange($minPrice, $maxPrice);
        }

        if ($search) {
            $query->search($search);
        }

        return $query->with(['category', 'regions', 'images'])->paginate($perPage);
    }

    /**
     * Get similar classifieds
     */
    public function getSimilarClassifieds(Classified $classified, int $limit = 4): Collection
    {
        return Classified::active()
            ->where('id', '!=', $classified->id)
            ->where('classified_category_id', $classified->classified_category_id)
            ->inRandomOrder()
            ->take($limit)
            ->get();
    }

    /**
     * Create classified listing (Alias/Wrapper)
     */
    public function createClassified(User $user, array $data): Classified
    {
        return $this->createListing($data, $user->id);
    }

    /**
     * Calculate cost for classified listing
     */
    public function calculateCost(array $regions, int $days): int
    {
        // Base cost per day per region
        $baseCostPerDay = 500; // $5.00 per day
        $regionCount = count($regions);
        $totalCost = ($baseCostPerDay * $days) * $regionCount;

        // Discount for longer durations
        if ($days >= 30) {
            $totalCost = (int) ($totalCost * 0.8); // 20% discount
        } elseif ($days >= 14) {
            $totalCost = (int) ($totalCost * 0.9); // 10% discount
        }

        return $totalCost;
    }

    /**
     * Create classified listing
     */
    public function createListing(array $data, mixed $userId, ?Workspace $workspace = null): Classified
    {
        // Handle User object or ID
        $uid = $userId instanceof User ? $userId->id : $userId;

        return DB::transaction(function () use ($data, $uid, $workspace) {
            $classified = Classified::create([
                'user_id' => $uid,
                'workspace_id' => $workspace?->id,
                'classified_category_id' => $data['classified_category_id'] ?? null, // Changed from category string
                'title' => $data['title'],
                'description' => $data['description'],
                'price' => $data['price'] ?? null,
                'price_type' => $data['price_type'] ?? 'fixed',
                'condition' => $data['condition'] ?? null,
                'contact_email' => $data['contact_email'] ?? null,
                'contact_phone' => $data['contact_phone'] ?? null,
                'status' => 'active', // Default to active for now (skipping payment for dev)
                'posted_at' => now(),
            ]);

            // Handle images
            if (! empty($data['images'])) {
                foreach ($data['images'] as $index => $image) {
                    $path = $image->store('classifieds', 'public');
                    $classified->images()->create([
                        'path' => $path,
                        'disk' => 'public',
                        'order' => $index,
                        'is_primary' => $index === 0,
                    ]);
                }
            }

            // Handle regions if provided
            if (! empty($data['region_ids'])) {
                $classified->regions()->attach($data['region_ids']);
            }

            return $classified;
        });
    }

    /**
     * Update classified listing
     */
    public function updateClassified(Classified $classified, array $data): Classified
    {
        return DB::transaction(function () use ($classified, $data) {
            $classified->update([
                'title' => $data['title'],
                'description' => $data['description'],
                'price' => $data['price'] ?? null,
                'price_type' => $data['price_type'] ?? 'fixed',
                'condition' => $data['condition'] ?? null,
                'classified_category_id' => $data['classified_category_id'] ?? $classified->classified_category_id,
                'contact_email' => $data['contact_email'] ?? $classified->contact_email,
                'contact_phone' => $data['contact_phone'] ?? $classified->contact_phone,
            ]);

            // Handle images update (if new images uploaded)
            // Logic for replacing images or adding to them would complicate things.
            // For now assuming existing images kept unless explicit delete logic added.
            // If API provides new images list, we might append.

            if (! empty($data['images'])) {
                foreach ($data['images'] as $index => $image) {
                    $path = $image->store('classifieds', 'public');
                    $classified->images()->create([
                        'path' => $path,
                        'disk' => 'public',
                        'order' => $classified->images()->count() + $index,
                        'is_primary' => false,
                    ]);
                }
            }

            // Sync regions
            if (isset($data['region_ids'])) {
                $classified->regions()->sync($data['region_ids']);
            }

            return $classified->fresh();
        });
    }

    public function deleteClassified(Classified $classified): void
    {
        $classified->delete();
    }

    public function markAsSold(Classified $classified): void
    {
        $classified->update(['status' => 'sold']);
    }

    public function reactivate(Classified $classified): void
    {
        $classified->update(['status' => 'active', 'posted_at' => now()]);
    }

    public function getMyClassifieds(User $user): Paginator|LengthAwarePaginator
    {
        return Classified::where('user_id', $user->id)
            ->with(['category', 'images'])
            ->latest()
            ->paginate(10);
    }

    public function getSavedClassifieds(User $user): Paginator|LengthAwarePaginator
    {
        return Classified::whereHas('saves', fn ($q) => $q->where('user_id', $user->id))
            ->with(['category', 'images', 'user'])
            ->latest()
            ->paginate(10);
    }

    /**
     * Activate classified after payment
     */
    public function activateClassified(Classified $classified, array $regionsData, int $totalDays): void
    {
        DB::transaction(function () use ($classified, $regionsData, $totalDays) {
            // Attach regions with days
            foreach ($regionsData as $regionData) {
                $classified->regions()->attach($regionData['region_id'], [
                    'days' => $regionData['days'],
                ]);
            }

            // Calculate expiration date
            $expiresAt = now()->addDays($totalDays);

            $classified->update([
                'status' => 'active',
                'posted_at' => now(),
                'expires_at' => $expiresAt,
            ]);
        });
    }

    /**
     * Extend classified listing (rerun)
     */
    public function extendListing(Classified $classified, array $regionsData, int $additionalDays): ClassifiedPayment
    {
        // Calculate new expiration
        $currentExpiresAt = $classified->expires_at ?? now();
        $newExpiresAt = $currentExpiresAt->copy()->addDays($additionalDays);

        // Update expiration
        $classified->update(['expires_at' => $newExpiresAt]);

        // Add additional regions if needed
        foreach ($regionsData as $regionData) {
            $existing = $classified->regions()->where('region_id', $regionData['region_id'])->first();
            if ($existing) {
                $classified->regions()->updateExistingPivot($regionData['region_id'], [
                    'days' => $existing->pivot->days + $regionData['days'],
                ]);
            } else {
                $classified->regions()->attach($regionData['region_id'], [
                    'days' => $regionData['days'],
                ]);
            }
        }

        // Create payment record for extension
        return ClassifiedPayment::create([
            'classified_id' => $classified->id,
            'workspace_id' => $classified->workspace_id ?? '', // Handle nullable workspace by giving valid UUID or handling it
            'amount' => $this->calculateCost($regionsData, $additionalDays),
            'status' => 'pending',
            'regions_data' => $regionsData,
            'total_days' => $additionalDays,
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\Classified;
use App\Models\ClassifiedPayment;
use App\Models\Region;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

final class ClassifiedService
{
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
    public function createListing(array $data, int $userId, ?Workspace $workspace = null): Classified
    {
        return DB::transaction(function () use ($data, $userId, $workspace) {
            $classified = Classified::create([
                'user_id' => $userId,
                'workspace_id' => $workspace?->id,
                'category' => $data['category'],
                'subcategory' => $data['subcategory'] ?? null,
                'title' => $data['title'],
                'description' => $data['description'],
                'price' => $data['price'] ?? null,
                'price_type' => $data['price_type'] ?? 'fixed',
                'condition' => $data['condition'] ?? null,
                'location' => $data['location'],
                'status' => 'pending_payment', // Will be activated after payment
            ]);

            // Handle images
            if (!empty($data['images'])) {
                foreach ($data['images'] as $index => $image) {
                    $path = $image->store('classifieds', 'public');
                    $classified->images()->create([
                        'image_path' => $path,
                        'image_disk' => 'public',
                        'order' => $index,
                    ]);
                }
            }

            return $classified;
        });
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
            'workspace_id' => $classified->workspace_id,
            'amount' => $this->calculateCost($regionsData, $additionalDays),
            'status' => 'pending',
            'regions_data' => $regionsData,
            'total_days' => $additionalDays,
        ]);
    }
}


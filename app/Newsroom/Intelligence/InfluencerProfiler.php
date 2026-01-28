<?php

declare(strict_types=1);

namespace App\Newsroom\Intelligence;

use App\Models\Influencer;
use App\Models\Region;
use App\Models\Signal;
use Illuminate\Support\Facades\Log;

class InfluencerProfiler
{
    /**
     * Analyze a signal to update influencer profiles
     */
    public function profileSignal(Signal $signal): void
    {
        if (empty($signal->author_name) || $signal->author_name === 'Unknown') {
            return;
        }

        // Try to infer region from signal metadata or fallback (context would be needed in real app)
        // For now, we'll skip if no region context is passed, or try to find a matching region
        // In a real implementation, Signal would likely have a region_id attached during ingestion
        $regionId = $signal->metadata['region_id'] ?? null;
        if (!$regionId) {
            return;
        }

        $influencer = Influencer::firstOrCreate(
            [
                'name' => $signal->author_name,
                'region_id' => $regionId,
            ],
            [
                'role' => $this->inferRole($signal),
                'influence_score' => 10, // Start low
                'last_interaction_at' => now(),
            ]
        );

        // Update interaction time and score
        $influencer->update([
            'last_interaction_at' => now(),
            'influence_score' => $influencer->influence_score + 1, // Increment score on activity
        ]);

        Log::info("[Newsroom] Updated profile for influencer: {$influencer->name}");
    }

    private function inferRole(Signal $signal): ?string
    {
        // Simple heuristic for now
        if ($signal->type === 'rss_item' && str_contains(strtolower($signal->source_identifier ?? ''), 'council')) {
            return 'City Official';
        }

        return 'Contributor';
    }
}

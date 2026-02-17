<?php

declare(strict_types=1);

namespace App\Services\Rollout;

use App\Jobs\Rollout\ProcessCommunityRolloutJob;
use App\Models\Community;
use App\Models\Rollout\CommunityRollout;
use App\Models\Rollout\StateRollout;
use Exception;
use Illuminate\Support\Facades\Log;

final class StateRolloutOrchestratorService
{
    /**
     * Initiate a complete state rollout.
     *
     * @param  array{batch_size?: int, throttle_ms?: int, skip_enrichment?: bool, priority_communities?: array}  $settings
     */
    public function initiateStateRollout(string $stateCode, array $settings = []): StateRollout
    {
        $stateCode = mb_strtoupper($stateCode);

        $existing = StateRollout::where('state_code', $stateCode)
            ->whereIn('status', [StateRollout::STATUS_IN_PROGRESS, StateRollout::STATUS_PLANNED])
            ->first();

        if ($existing) {
            throw new Exception("State {$stateCode} already has an active rollout: {$existing->id}");
        }

        $communities = Community::where('state', $stateCode)
            ->orWhere('state_code', $stateCode)
            ->get();

        if ($communities->isEmpty()) {
            throw new Exception("No communities found for state: {$stateCode}");
        }

        $stateName = $this->getStateName($stateCode);

        $defaults = [
            'batch_size' => 5,
            'throttle_ms' => 100,
            'skip_enrichment' => false,
            'priority_communities' => [],
        ];
        $settings = array_merge($defaults, $settings);

        $stateRollout = StateRollout::create([
            'state_code' => $stateCode,
            'state_name' => $stateName,
            'status' => StateRollout::STATUS_IN_PROGRESS,
            'total_communities' => $communities->count(),
            'started_at' => now(),
            'settings' => $settings,
            'initiated_by' => auth()->id() ?? 'system',
        ]);

        Log::info('State rollout initiated', [
            'state' => $stateCode,
            'communities' => $communities->count(),
            'batch_size' => $settings['batch_size'],
        ]);

        foreach ($communities as $community) {
            CommunityRollout::create([
                'state_rollout_id' => $stateRollout->id,
                'community_id' => $community->id,
                'status' => CommunityRollout::STATUS_QUEUED,
            ]);
        }

        $this->dispatchNextBatch($stateRollout);

        return $stateRollout;
    }

    public function dispatchNextBatch(StateRollout $stateRollout): int
    {
        $batchSize = $stateRollout->settings['batch_size'] ?? 5;
        $priorityCommunities = $stateRollout->settings['priority_communities'] ?? [];

        $query = $stateRollout->communityRollouts()
            ->where('status', CommunityRollout::STATUS_QUEUED);

        if (! empty($priorityCommunities)) {
            $placeholders = implode(',', array_fill(0, count($priorityCommunities), '?'));
            $query->orderByRaw("CASE WHEN community_id IN ({$placeholders}) THEN 0 ELSE 1 END", $priorityCommunities);
        }

        $batch = $query->limit($batchSize)->get();

        foreach ($batch as $communityRollout) {
            ProcessCommunityRolloutJob::dispatch($communityRollout)
                ->onQueue('rollout');
        }

        Log::info('Dispatched rollout batch', [
            'state' => $stateRollout->state_code,
            'batch_size' => $batch->count(),
            'remaining' => $stateRollout->communityRollouts()
                ->where('status', CommunityRollout::STATUS_QUEUED)
                ->count() - $batch->count(),
        ]);

        return $batch->count();
    }

    public function pauseStateRollout(string $rolloutId): StateRollout
    {
        $rollout = StateRollout::findOrFail($rolloutId);
        $rollout->update(['status' => StateRollout::STATUS_PAUSED]);

        $rollout->communityRollouts()
            ->where('status', CommunityRollout::STATUS_QUEUED)
            ->update(['status' => CommunityRollout::STATUS_PAUSED]);

        Log::info('State rollout paused', ['state' => $rollout->state_code]);

        return $rollout->fresh();
    }

    public function resumeStateRollout(string $rolloutId): StateRollout
    {
        $rollout = StateRollout::findOrFail($rolloutId);

        $rollout->communityRollouts()
            ->where('status', CommunityRollout::STATUS_PAUSED)
            ->update(['status' => CommunityRollout::STATUS_QUEUED]);

        $rollout->update(['status' => StateRollout::STATUS_IN_PROGRESS]);

        $this->dispatchNextBatch($rollout);

        Log::info('State rollout resumed', ['state' => $rollout->state_code]);

        return $rollout->fresh();
    }

    /**
     * @return array{rollout: StateRollout, progress_percentage: float, status_breakdown: array, total_businesses: int, total_news_sources: int, total_cost: float, estimated_remaining_cost: float}
     */
    public function getStateProgress(string $rolloutId): array
    {
        $rollout = StateRollout::with('communityRollouts')->findOrFail($rolloutId);

        $statuses = $rollout->communityRollouts->groupBy('status')->map->count();

        return [
            'rollout' => $rollout,
            'progress_percentage' => $rollout->progress_percentage,
            'status_breakdown' => $statuses->toArray(),
            'total_businesses' => $rollout->total_businesses_discovered,
            'total_news_sources' => $rollout->total_news_sources_created,
            'total_cost' => $rollout->total_api_cost,
            'estimated_remaining_cost' => $this->estimateRemainingCost($rollout),
        ];
    }

    private function estimateRemainingCost(StateRollout $rollout): float
    {
        $remaining = $rollout->total_communities - $rollout->completed_communities - $rollout->failed_communities;
        $avgCostPerCommunity = $rollout->completed_communities > 0
            ? $rollout->total_api_cost / $rollout->completed_communities
            : 34.00;

        return round($remaining * $avgCostPerCommunity, 2);
    }

    private function getStateName(string $code): string
    {
        $states = [
            'AL' => 'Alabama', 'AK' => 'Alaska', 'AZ' => 'Arizona', 'AR' => 'Arkansas',
            'CA' => 'California', 'CO' => 'Colorado', 'CT' => 'Connecticut', 'DE' => 'Delaware',
            'FL' => 'Florida', 'GA' => 'Georgia', 'HI' => 'Hawaii', 'ID' => 'Idaho',
            'IL' => 'Illinois', 'IN' => 'Indiana', 'IA' => 'Iowa', 'KS' => 'Kansas',
            'KY' => 'Kentucky', 'LA' => 'Louisiana', 'ME' => 'Maine', 'MD' => 'Maryland',
            'MA' => 'Massachusetts', 'MI' => 'Michigan', 'MN' => 'Minnesota', 'MS' => 'Mississippi',
            'MO' => 'Missouri', 'MT' => 'Montana', 'NE' => 'Nebraska', 'NV' => 'Nevada',
            'NH' => 'New Hampshire', 'NJ' => 'New Jersey', 'NM' => 'New Mexico', 'NY' => 'New York',
            'NC' => 'North Carolina', 'ND' => 'North Dakota', 'OH' => 'Ohio', 'OK' => 'Oklahoma',
            'OR' => 'Oregon', 'PA' => 'Pennsylvania', 'RI' => 'Rhode Island', 'SC' => 'South Carolina',
            'SD' => 'South Dakota', 'TN' => 'Tennessee', 'TX' => 'Texas', 'UT' => 'Utah',
            'VT' => 'Vermont', 'VA' => 'Virginia', 'WA' => 'Washington', 'WV' => 'West Virginia',
            'WI' => 'Wisconsin', 'WY' => 'Wyoming', 'DC' => 'District of Columbia',
        ];

        return $states[$code] ?? $code;
    }
}

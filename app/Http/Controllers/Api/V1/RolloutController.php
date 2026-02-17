<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Rollout\StateRollout;
use App\Services\Rollout\StateRolloutOrchestratorService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class RolloutController extends Controller
{
    public function __construct(
        private readonly StateRolloutOrchestratorService $orchestrator,
    ) {}

    public function index(): JsonResponse
    {
        $rollouts = StateRollout::withCount([
            'communityRollouts',
            'communityRollouts as completed_count' => fn ($q) => $q->where('status', 'completed'),
            'communityRollouts as failed_count' => fn ($q) => $q->where('status', 'failed'),
            'communityRollouts as in_progress_count' => fn ($q) => $q->whereNotIn('status', ['queued', 'completed', 'failed', 'paused']),
        ])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $rollouts]);
    }

    public function show(string $stateCode): JsonResponse
    {
        $rollout = StateRollout::where('state_code', mb_strtoupper($stateCode))
            ->latest()
            ->first();

        if (! $rollout) {
            return response()->json(['error' => 'No rollout found for state: '.$stateCode], 404);
        }

        $progress = $this->orchestrator->getStateProgress($rollout->id);

        $communities = $rollout->communityRollouts()
            ->with('community:id,name')
            ->orderByRaw("CASE status WHEN 'failed' THEN 1 WHEN 'completed' THEN 3 ELSE 2 END")
            ->get(['id', 'community_id', 'status', 'current_phase', 'businesses_discovered',
                'news_sources_created', 'api_cost_estimate', 'error_log', 'updated_at']);

        return response()->json([
            'data' => [
                'rollout' => $rollout,
                'progress' => $progress,
                'communities' => $communities,
            ],
        ]);
    }

    public function communityDetail(string $stateCode, string $communityId): JsonResponse
    {
        $rollout = StateRollout::where('state_code', mb_strtoupper($stateCode))->latest()->first();
        if (! $rollout) {
            return response()->json(['error' => 'No rollout found'], 404);
        }

        $community = $rollout->communityRollouts()
            ->where('community_id', $communityId)
            ->with(['community', 'apiUsage'])
            ->first();

        if (! $community) {
            return response()->json(['error' => 'Community not found in rollout'], 404);
        }

        return response()->json(['data' => $community]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state_code' => 'required|string|size:2',
            'batch_size' => 'integer|min:1|max:20',
            'throttle_ms' => 'integer|min:50|max:5000',
            'skip_enrichment' => 'boolean',
            'priority_communities' => 'array',
        ]);

        try {
            $rollout = $this->orchestrator->initiateStateRollout(
                $validated['state_code'],
                array_filter([
                    'batch_size' => $validated['batch_size'] ?? null,
                    'throttle_ms' => $validated['throttle_ms'] ?? null,
                    'skip_enrichment' => $validated['skip_enrichment'] ?? null,
                    'priority_communities' => $validated['priority_communities'] ?? null,
                ])
            );

            return response()->json(['data' => $rollout], 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function pause(string $id): JsonResponse
    {
        $rollout = $this->orchestrator->pauseStateRollout($id);

        return response()->json(['data' => $rollout]);
    }

    public function resume(string $id): JsonResponse
    {
        $rollout = $this->orchestrator->resumeStateRollout($id);

        return response()->json(['data' => $rollout]);
    }

    public function costs(): JsonResponse
    {
        $costs = DB::table('rollout_api_usage')
            ->select(
                'api_name',
                'sku_tier',
                DB::raw('SUM(request_count) as total_requests'),
                DB::raw('SUM(estimated_cost) as total_cost'),
                DB::raw('SUM(actual_response_count) as total_responses')
            )
            ->groupBy('api_name', 'sku_tier')
            ->orderBy('total_cost', 'desc')
            ->get();

        $totalCost = $costs->sum('total_cost');

        return response()->json([
            'data' => [
                'breakdown' => $costs,
                'total_cost' => round($totalCost, 2),
            ],
        ]);
    }
}

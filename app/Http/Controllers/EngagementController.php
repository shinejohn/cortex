<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\UserEngagementTrackingService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

final class EngagementController extends Controller
{
    public function __construct(
        private readonly UserEngagementTrackingService $engagementService
    ) {}

    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'engagements' => 'required|array|max:100',
            'engagements.*.user_id' => 'required|uuid|exists:users,id',
            'engagements.*.type' => [
                'required',
                'string',
                Rule::in([
                    'post_view',
                    'post_like',
                    'post_comment',
                    'post_share',
                    'profile_view',
                    'scroll_depth',
                    'time_spent',
                    // Day News article engagement types
                    'article_view',
                    'article_like',
                    'article_comment',
                    'article_share',
                    'article_read_time',
                    'article_scroll_depth',
                ]),
            ],
            'engagements.*.data' => 'sometimes|array',
        ]);

        try {
            $engagements = collect($validated['engagements'])->map(function ($engagement) {
                return [
                    'user_id' => $engagement['user_id'],
                    'type' => $engagement['type'],
                    'data' => json_encode($engagement['data'] ?? []),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->toArray();

            $this->engagementService->recordBulkEngagement($engagements);

            return response()->json([
                'success' => true,
                'tracked' => count($engagements),
            ]);

        } catch (Exception $e) {
            Log::error('Failed to track engagement batch', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
                'engagement_count' => count($validated['engagements']),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to track engagement data',
            ], 500);
        }
    }

    public function sessionStart(Request $request): JsonResponse
    {
        try {
            $this->engagementService->trackSessionStart($request->user());

            return response()->json(['success' => true]);
        } catch (Exception $e) {
            Log::error('Failed to track session start', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to track session start',
            ], 500);
        }
    }

    public function sessionEnd(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_duration' => 'sometimes|integer|min:0|max:86400', // Max 24 hours
        ]);

        try {
            $this->engagementService->trackSessionEnd($request->user());

            return response()->json(['success' => true]);
        } catch (Exception $e) {
            Log::error('Failed to track session end', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
                'session_duration' => $validated['session_duration'] ?? null,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to track session end',
            ], 500);
        }
    }
}

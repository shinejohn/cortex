<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentModerationLog;
use App\Services\Creator\ContentModeratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ContentModerationController extends Controller
{
    public function __construct(
        private readonly ContentModeratorService $moderator,
    ) {}

    /**
     * GET /api/v1/moderation/{contentType}/{contentId}
     */
    public function status(string $contentType, string $contentId): JsonResponse
    {
        $log = $this->moderator->getStatus($contentType, $contentId);

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }

    /**
     * POST /api/v1/moderation/{logId}/feedback
     */
    public function feedback(Request $request, string $logId): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:approved,rejected,needs_review,flagged',
            'confidence' => 'sometimes|numeric|between:0,1',
            'flags' => 'sometimes|array',
            'suggestions' => 'sometimes|array',
            'notes' => 'sometimes|string|max:2000',
            'resolution' => 'sometimes|string|in:published,edited,removed,escalated',
            'resolved_by' => 'sometimes|uuid',
        ]);

        $log = $this->moderator->receiveFeedback($logId, $validated);

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }

    /**
     * GET /api/v1/moderation/pending
     */
    public function pending(Request $request): JsonResponse
    {
        $logs = ContentModerationLog::query()
            ->whereIn('status', ['pending', 'needs_review', 'flagged'])
            ->when($request->content_type, fn ($q) => $q->where('content_type', $request->content_type))
            ->when($request->region_id, fn ($q) => $q->where('region_id', $request->region_id))
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }
}

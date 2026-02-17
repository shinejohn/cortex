<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Exceptions\DuplicateAppealException;
use App\Exceptions\DuplicateComplaintException;
use App\Http\Controllers\Controller;
use App\Models\ContentComplaint;
use App\Services\Moderation\ContentComplaintService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ModerationComplaintController extends Controller
{
    public function __construct(
        private readonly ContentComplaintService $complaintService,
    ) {}

    public function store(Request $request, string $contentType, string $contentId): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|in:'.implode(',', array_keys(ContentComplaint::REASONS)),
            'complaint_text' => 'nullable|string|max:500',
        ]);

        try {
            $complaint = $this->complaintService->fileComplaint(
                contentType: $contentType,
                contentId: $contentId,
                userId: $request->user()->id,
                reason: $validated['reason'],
                freeText: $validated['complaint_text'] ?? null,
            );
        } catch (DuplicateComplaintException $e) {
            return response()->json([
                'error' => 'duplicate_complaint',
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Complaint submitted successfully. We will review the content.',
            'complaint_id' => $complaint->id,
        ], 201);
    }

    public function appeal(Request $request, string $logId): JsonResponse
    {
        $validated = $request->validate([
            'appeal_text' => 'required|string|max:1000',
        ]);

        try {
            $complaint = $this->complaintService->fileAppeal(
                moderationLogId: $logId,
                creatorId: $request->user()->id,
                appealText: $validated['appeal_text'],
            );
        } catch (DuplicateAppealException $e) {
            return response()->json([
                'error' => 'duplicate_appeal',
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'error' => 'unauthorized',
                'message' => 'You are not authorized to appeal this decision.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Appeal submitted successfully. We will review your appeal.',
            'complaint_id' => $complaint->id,
        ], 201);
    }

    public function complaintStatus(Request $request, string $contentType, string $contentId): JsonResponse
    {
        $existing = ContentComplaint::where('content_type', $contentType)
            ->where('content_id', $contentId)
            ->where('complainant_id', $request->user()->id)
            ->first();

        return response()->json([
            'has_complained' => $existing !== null,
            'complaint_id' => $existing?->id,
        ]);
    }
}

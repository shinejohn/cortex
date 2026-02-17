<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Services\EventCity\BehavioralTrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BehavioralTrackingController extends Controller
{
    public function __construct(
        private readonly BehavioralTrackingService $trackingService
    ) {}

    /**
     * Record a behavioral event for the authenticated user.
     */
    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_type' => ['required', 'string', 'max:50'],
            'content_type' => ['nullable', 'string', 'max:50'],
            'content_id' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:50'],
            'context' => ['nullable', 'array'],
        ]);

        $event = $this->trackingService->recordEvent(
            $request->user(),
            $validated['event_type'],
            $validated['content_type'] ?? null,
            $validated['content_id'] ?? null,
            $validated['category'] ?? null,
            $validated['context'] ?? [],
        );

        return response()->json([
            'success' => true,
            'event_id' => $event->id,
        ], 201);
    }
}

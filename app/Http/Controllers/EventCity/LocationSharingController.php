<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Models\LocationShare;
use App\Models\SocialGroup;
use App\Services\EventCity\LocationSharingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class LocationSharingController extends Controller
{
    public function __construct(
        private readonly LocationSharingService $sharingService
    ) {}

    /**
     * Start sharing location.
     */
    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'event_id' => ['nullable', 'string', 'exists:events,id'],
            'group_id' => ['nullable', 'string', 'exists:social_groups,id'],
            'duration_minutes' => ['nullable', 'integer', 'min:5', 'max:480'],
        ]);

        $share = $this->sharingService->startSharing(
            $request->user(),
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            $validated['event_id'] ?? null,
            $validated['group_id'] ?? null,
            $validated['duration_minutes'] ?? 60,
        );

        return response()->json([
            'success' => true,
            'share' => $share,
        ], 201);
    }

    /**
     * Update an active location share.
     */
    public function update(LocationShare $share, Request $request): JsonResponse
    {
        if ($share->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['nullable', 'numeric', 'min:0'],
        ]);

        $share = $this->sharingService->updateLocation(
            $share,
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            isset($validated['accuracy']) ? (float) $validated['accuracy'] : null,
        );

        return response()->json([
            'success' => true,
            'share' => $share,
        ]);
    }

    /**
     * Stop sharing location.
     */
    public function stop(LocationShare $share, Request $request): JsonResponse
    {
        if ($share->user_id !== $request->user()->id) {
            abort(403);
        }

        $share = $this->sharingService->stopSharing($share);

        return response()->json([
            'success' => true,
            'share' => $share,
        ]);
    }

    /**
     * Get active location shares for a group.
     */
    public function groupShares(SocialGroup $group, Request $request): JsonResponse
    {
        $shares = LocationShare::query()
            ->where('group_id', $group->id)
            ->active()
            ->with('user:id,name')
            ->get();

        return response()->json([
            'shares' => $shares,
        ]);
    }
}

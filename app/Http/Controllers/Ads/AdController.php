<?php

declare(strict_types=1);

namespace App\Http\Controllers\Ads;

use App\Http\Controllers\Controller;
use App\Services\AdServerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

final class AdController extends Controller
{
    public function __construct(
        private readonly AdServerService $adService
    ) {}

    /**
     * Serve an ad for a given platform and slot
     */
    public function serve(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform' => 'required|string',
            'slot' => 'required|string',
            'community_id' => 'nullable|integer|exists:communities,id',
        ]);

        $ad = $this->adService->getAd(
            $validated['platform'],
            $validated['slot'],
            $validated['community_id'] ?? null,
            $request->session()->getId()
        );

        if (!$ad) {
            return response()->json(['ad' => null]);
        }

        return response()->json(['ad' => $ad]);
    }

    /**
     * Track a click and redirect
     */
    public function click(Request $request, int $impression): RedirectResponse
    {
        $url = $this->adService->recordClick($impression);

        if (!$url) {
            return redirect('/')->with('error', 'Invalid ad impression.');
        }

        return redirect($url);
    }
}

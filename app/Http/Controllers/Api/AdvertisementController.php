<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Region;
use App\Services\AdvertisementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AdvertisementController extends Controller
{
    public function __construct(
        private readonly AdvertisementService $adService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $platform = $request->query('platform', 'day_news');
        $placement = $request->query('placement', 'sidebar');
        $regionId = $request->query('region_id');

        $region = $regionId ? Region::find($regionId) : null;

        $ads = $this->adService->getActiveAds($platform, $region, $placement);

        return response()->json([
            'ads' => $ads->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable_type' => $ad->advertable_type,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at->toISOString(),
            ]),
        ]);
    }

    public function trackImpression(Request $request, Advertisement $ad): JsonResponse
    {
        $this->adService->trackImpression($ad);

        return response()->json(['success' => true]);
    }

    public function trackClick(Request $request, Advertisement $ad): JsonResponse
    {
        $this->adService->trackClick($ad);

        return response()->json(['success' => true]);
    }
}

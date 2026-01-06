<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Api\V1\AdvertisementResource;
use App\Models\Advertisement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AdvertisementController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Advertisement::query()->active();

        if ($request->has('platform')) {
            $query->where('platform', $request->platform);
        }

        if ($request->has('placement')) {
            $query->where('placement', $request->placement);
        }

        $ads = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($ads);
    }

    public function trackImpression(Request $request, Advertisement $advertisement): JsonResponse
    {
        $advertisement->incrementImpressions();
        return $this->success(null, 'Impression tracked');
    }

    public function trackClick(Request $request, Advertisement $advertisement): JsonResponse
    {
        $advertisement->incrementClicks();
        return $this->success(null, 'Click tracked');
    }
}



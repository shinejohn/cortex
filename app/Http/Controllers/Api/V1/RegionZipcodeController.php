<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreRegionZipcodeRequest;
use App\Models\Region;
use App\Models\RegionZipcode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class RegionZipcodeController extends BaseController
{
    /**
     * Get ZIP codes for region.
     */
    public function index(Request $request, Region $region): JsonResponse
    {
        $zipcodes = $region->zipcodes()->paginate($request->get('per_page', 50));

        return $this->paginated($zipcodes);
    }

    /**
     * Add ZIP code to region.
     */
    public function store(StoreRegionZipcodeRequest $request, Region $region): JsonResponse
    {
        $this->authorize('update', $region);

        $zipcode = $region->zipcodes()->create($request->validated());

        return $this->success($zipcode, 'ZIP code added successfully', 201);
    }

    /**
     * Find region by ZIP code.
     */
    public function findByZipcode(Request $request, string $code): JsonResponse
    {
        $zipcode = RegionZipcode::where('zipcode', $code)->first();

        if (!$zipcode) {
            return $this->notFound('Region not found for ZIP code');
        }

        return $this->success(new \App\Http\Resources\Api\V1\RegionResource($zipcode->region));
    }
}



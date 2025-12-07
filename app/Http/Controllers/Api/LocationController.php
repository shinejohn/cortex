<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

final class LocationController extends Controller
{
    public function __construct(
        private readonly LocationService $locationService
    ) {}

    /**
     * Detect location from browser geolocation coordinates
     */
    public function detectFromBrowser(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $latitude = (float) $request->input('latitude');
        $longitude = (float) $request->input('longitude');

        $region = $this->locationService->findNearestRegion($latitude, $longitude);

        if ($region === null) {
            return response()->json([
                'success' => false,
                'message' => 'No region found near your location',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'region' => [
                'id' => $region->id,
                'name' => $region->name,
                'slug' => $region->slug,
                'type' => $region->type,
                'full_name' => $region->full_name,
                'latitude' => $region->latitude,
                'longitude' => $region->longitude,
            ],
        ]);
    }

    /**
     * Set user's region preference
     */
    public function setRegion(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'region_id' => ['required', 'uuid', 'exists:regions,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $regionId = $request->input('region_id');
        $region = Region::find($regionId);

        if ($region === null || ! $region->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Region not found or inactive',
            ], 404);
        }

        $this->locationService->setUserLocation($regionId);

        return response()->json([
            'success' => true,
            'message' => 'Location preference saved',
            'region' => [
                'id' => $region->id,
                'name' => $region->name,
                'slug' => $region->slug,
                'type' => $region->type,
                'full_name' => $region->full_name,
                'latitude' => $region->latitude,
                'longitude' => $region->longitude,
            ],
        ]);
    }

    /**
     * Search regions by name or zipcode
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\p{L}\p{N}\s\-\',\.]+$/u'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $query = mb_trim($request->input('query'));
        $limit = min((int) $request->input('limit', 10), 20);

        $regions = $this->locationService->searchRegions($query, $limit);

        return response()->json([
            'success' => true,
            'regions' => $regions->map(fn ($region) => [
                'id' => $region->id,
                'name' => $region->name,
                'slug' => $region->slug,
                'type' => $region->type,
                'full_name' => $region->full_name,
                'latitude' => $region->latitude,
                'longitude' => $region->longitude,
            ]),
        ]);
    }

    /**
     * Clear user's location preference
     */
    public function clear(): JsonResponse
    {
        $this->locationService->clearUserLocation();

        return response()->json([
            'success' => true,
            'message' => 'Location preference cleared',
        ]);
    }
}

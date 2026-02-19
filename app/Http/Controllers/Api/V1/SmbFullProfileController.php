<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SmbBusiness;
use App\Services\SmbFullProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SmbFullProfileController extends Controller
{
    public function __construct(
        private readonly SmbFullProfileService $profileService
    ) {}

    public function fullProfile(SmbBusiness $smbBusiness): JsonResponse
    {
        $this->authorize('view', $smbBusiness);

        $profile = $this->profileService->getFullProfile($smbBusiness);

        return response()->json(['data' => $profile]);
    }

    public function aiContext(SmbBusiness $smbBusiness): JsonResponse
    {
        $this->authorize('view', $smbBusiness);

        $context = $this->profileService->getAiContext($smbBusiness);

        return response()->json(['data' => $context]);
    }

    public function intelligenceSummary(SmbBusiness $smbBusiness): JsonResponse
    {
        $this->authorize('view', $smbBusiness);

        $summary = $this->profileService->getIntelligenceSummary($smbBusiness);

        return response()->json(['data' => ['summary' => $summary]]);
    }

    public function updateSection(Request $request, SmbBusiness $smbBusiness, string $section): JsonResponse
    {
        $this->authorize('update', $smbBusiness);

        $data = $request->all();
        if (! is_array($data)) {
            $data = [];
        }

        $this->profileService->updateSection($smbBusiness, $section, $data);

        return response()->json([
            'message' => 'Section updated successfully',
            'data' => $this->profileService->getFullProfile($smbBusiness),
        ]);
    }

    public function enrich(SmbBusiness $smbBusiness): JsonResponse
    {
        $this->authorize('update', $smbBusiness);

        $this->profileService->requestEnrichment($smbBusiness);

        return response()->json([
            'message' => 'Enrichment triggered successfully',
            'data' => ['last_enriched_at' => $smbBusiness->fresh()->last_enriched_at?->toIso8601String()],
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\Classified;
use App\Services\ClassifiedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ClassifiedSaveController extends Controller
{
    public function __construct(
        private readonly ClassifiedService $classifiedService
    ) {}

    /**
     * Save a classified listing.
     */
    public function store(Classified $classified, Request $request): JsonResponse
    {
        $this->authorize('save', $classified);

        $this->classifiedService->saveClassified($classified, $request->user());

        return response()->json([
            'success' => true,
            'saves_count' => $classified->fresh()->saves_count,
        ]);
    }

    /**
     * Unsave a classified listing.
     */
    public function destroy(Classified $classified, Request $request): JsonResponse
    {
        $this->authorize('save', $classified);

        $this->classifiedService->unsaveClassified($classified, $request->user());

        return response()->json([
            'success' => true,
            'saves_count' => $classified->fresh()->saves_count,
        ]);
    }
}

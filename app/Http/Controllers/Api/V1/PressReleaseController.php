<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PressRelease;
use App\Services\Newsroom\PressReleaseIntakeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PressReleaseController extends Controller
{
    public function store(Request $request, PressReleaseIntakeService $intake): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email',
            'contact_phone' => 'nullable|string|max:50',
            'headline' => 'required|string|max:500',
            'subheadline' => 'nullable|string|max:500',
            'body' => 'required|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'release_date' => 'nullable|date',
            'embargo_until' => 'nullable|date|after:now',
        ]);

        $pr = $intake->processWebSubmission($validated);

        return response()->json([
            'data' => $pr,
            'message' => 'Press release received and queued for processing.',
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $pr = PressRelease::findOrFail($id);

        return response()->json([
            'data' => $pr,
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiCreatorSession;
use App\Models\Region;
use App\Services\Creator\AiCreatorAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AiCreatorController extends Controller
{
    public function __construct(
        private readonly AiCreatorAssistantService $assistant,
    ) {}

    public function createSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content_type' => 'required|string|in:article,event,ad,announcement,coupon,classified,legal_notice',
            'region_id' => 'sometimes|uuid|exists:regions,id',
        ]);

        $session = AiCreatorSession::create([
            'user_id' => auth()->id(),
            'region_id' => $validated['region_id'] ?? null,
            'content_type' => $validated['content_type'],
            'status' => 'active',
        ]);

        return response()->json(['success' => true, 'data' => $session], 201);
    }

    public function analyze(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:500',
            'content' => 'required|string|max:50000',
        ]);

        $region = $session->region_id ? Region::find($session->region_id) : null;
        $result = $this->assistant->analyzeContent(
            $validated['title'] ?? '',
            $validated['content'],
            $session->content_type,
            $region
        );

        $session->update([
            'current_title' => $validated['title'] ?? $session->current_title,
            'current_content' => $validated['content'],
            'seo_analysis' => $result['seo_analysis'],
            'quality_analysis' => $result['quality_analysis'],
            'classification' => $result['classification'],
        ]);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function factCheck(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'content' => 'required|string|max:50000',
        ]);

        $results = $this->assistant->extractAndCheckFacts($validated['content']);

        $session->update(['fact_check_results' => $results]);

        return response()->json(['success' => true, 'data' => $results]);
    }

    public function generate(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'prompt' => 'required|string|max:5000',
            'tone' => 'sometimes|string|in:professional,casual,formal,conversational,urgent',
            'length' => 'sometimes|string|in:short,medium,long',
        ]);

        $region = $session->region_id ? Region::find($session->region_id) : null;
        $result = $this->assistant->generateContent(
            $validated['prompt'],
            $session->content_type,
            $region,
            ['tone' => $validated['tone'] ?? 'professional', 'length' => $validated['length'] ?? 'medium']
        );

        $session->update(['ai_suggestions' => $result]);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function headlines(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'topic' => 'required|string|max:500',
        ]);

        $region = $session->region_id ? Region::find($session->region_id) : null;
        $result = $this->assistant->generateHeadlines($validated['topic'], $session->content_type, $region);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function seo(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'content' => 'required|string|max:50000',
            'tags' => 'sometimes|array',
        ]);

        $result = $this->assistant->generateSeoMetadata($validated['title'], $validated['content'], $validated['tags'] ?? []);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function images(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'tags' => 'sometimes|array',
        ]);

        $result = $this->assistant->suggestImages($validated['title'], $validated['tags'] ?? []);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function parseEvent(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'description' => 'required|string|max:10000',
        ]);

        $region = $session->region_id ? Region::find($session->region_id) : null;
        $result = $this->assistant->parseEventDescription($validated['description'], $region);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function matchVenue(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'query' => 'required|string|max:500',
        ]);

        $region = $session->region_id ? Region::find($session->region_id) : null;
        $result = $this->assistant->matchVenue($validated['query'], $region);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function matchPerformer(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'query' => 'required|string|max:500',
        ]);

        $region = $session->region_id ? Region::find($session->region_id) : null;
        $result = $this->assistant->matchPerformer($validated['query'], $region);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function checkCompliance(Request $request, AiCreatorSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $validated = $request->validate([
            'content' => 'required|string|max:50000',
            'ad_type' => 'required|string|in:display,native,sponsored,classified',
        ]);

        $result = $this->assistant->checkAdCompliance($validated['content'], $validated['ad_type']);

        return response()->json(['success' => true, 'data' => $result]);
    }

    private function authorizeSession(AiCreatorSession $session): void
    {
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to creator session.');
        }
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Models\LocalVoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CommunityController extends Controller
{
    /**
     * Display the community page.
     */
    public function index(Request $request): Response
    {
        // Fetch latest local voices
        $stories = LocalVoice::query()
            ->with('business:id,name,slug')
            ->orderBy('published_at', 'desc')
            ->limit(20)
            ->get();

        return Inertia::render('downtown-guide/community/index', [
            'stories' => $stories,
        ]);
    }

    /**
     * Show a specific community story.
     */
    public function show(LocalVoice $story): Response
    {
        $story->load('business:id,name,slug');

        return Inertia::render('downtown-guide/community/show', [
            'story' => $story,
        ]);
    }
}

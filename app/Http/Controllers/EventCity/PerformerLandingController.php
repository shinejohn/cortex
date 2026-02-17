<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Models\Performer;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

final class PerformerLandingController extends Controller
{
    public function show(string $slug): Response
    {
        $performer = Performer::where('landing_page_slug', $slug)
            ->where('landing_page_published', true)
            ->where('tips_enabled', true)
            ->firstOrFail();

        $upcomingEvents = $performer->events()
            ->where('event_date', '>=', now())
            ->orderBy('event_date')
            ->limit(5)
            ->get(['id', 'title', 'event_date', 'time']);

        return Inertia::render('event-city/performers/landing', [
            'performer' => [
                'id' => $performer->id,
                'name' => $performer->name,
                'bio' => $performer->bio,
                'profile_image' => $performer->profile_image,
                'genres' => $performer->genres,
                'home_city' => $performer->home_city,
                'is_verified' => $performer->is_verified,
                'total_tip_count' => $performer->total_tip_count,
                'landing_page_slug' => $performer->landing_page_slug,
                'workspace_id' => $performer->workspace_id,
            ],
            'upcomingEvents' => $upcomingEvents,
            'stripePublicKey' => config('services.stripe.key'),
        ]);
    }

    public function recordScan(string $slug): JsonResponse
    {
        $performer = Performer::where('landing_page_slug', $slug)->firstOrFail();

        $flyer = $performer->qrFlyers()->where('is_active', true)->latest()->first();

        if ($flyer) {
            $flyer->incrementScanCount();
        }

        return response()->json(['success' => true]);
    }
}

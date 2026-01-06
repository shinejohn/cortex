<?php

declare(strict_types=1);

namespace App\Http\Controllers\Email;

use App\Http\Controllers\Controller;
use App\Models\EmailSend;
use App\Models\EmailSubscriber;
use App\Services\EmailDeliveryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TrackingController extends Controller
{
    public function __construct(
        private readonly EmailDeliveryService $emailService
    ) {}

    /**
     * Track email open
     */
    public function trackOpen(EmailSend $send): \Illuminate\Http\Response
    {
        $this->emailService->trackOpen($send);

        // Return 1x1 transparent pixel
        $pixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

        return response($pixel, 200)
            ->header('Content-Type', 'image/gif')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * Track email click
     */
    public function trackClick(Request $request, EmailSend $send): RedirectResponse
    {
        $url = $request->query('url');
        if (!$url) {
            return redirect('/');
        }

        $destinationUrl = $this->emailService->trackClick($send, $url);

        return redirect($destinationUrl);
    }

    /**
     * Unsubscribe page
     */
    public function unsubscribe(EmailSubscriber $subscriber): Response
    {
        return Inertia::render('Email/Unsubscribe', [
            'subscriber' => $subscriber,
        ]);
    }

    /**
     * Process unsubscribe
     */
    public function processUnsubscribe(Request $request, EmailSubscriber $subscriber): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        $subscriber->update([
            'status' => 'unsubscribed',
            'unsubscribed_at' => now(),
            'unsubscribe_reason' => $validated['reason'] ?? null,
        ]);

        return redirect()->route('email.unsubscribe', $subscriber)
            ->with('success', 'You have been unsubscribed successfully.');
    }

    /**
     * Email preferences page
     */
    public function preferences(EmailSubscriber $subscriber): Response
    {
        return Inertia::render('Email/Preferences', [
            'subscriber' => $subscriber,
        ]);
    }

    /**
     * Update email preferences
     */
    public function updatePreferences(Request $request, EmailSubscriber $subscriber): RedirectResponse
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.daily_digest' => 'boolean',
            'preferences.breaking_news' => 'boolean',
            'preferences.weekly_newsletter' => 'boolean',
        ]);

        $subscriber->update([
            'preferences' => $validated['preferences'],
        ]);

        return redirect()->route('email.preferences', $subscriber)
            ->with('success', 'Preferences updated successfully.');
    }
}

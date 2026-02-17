<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Share;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use InvalidArgumentException;

final class ShareController extends Controller
{
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shareable_type' => 'required|string|in:event,performer,venue',
            'shareable_id' => 'required|uuid',
            'channel' => 'required|string|in:link,facebook,twitter,sms,email,whatsapp,copy,dm',
        ]);

        $modelClass = match ($validated['shareable_type']) {
            'event' => \App\Models\Event::class,
            'performer' => \App\Models\Performer::class,
            'venue' => \App\Models\Venue::class,
            default => throw new InvalidArgumentException('Invalid shareable type'),
        };

        $entity = $modelClass::findOrFail($validated['shareable_id']);
        $baseUrl = config('app.url');
        $trackingCode = Str::upper(Str::random(12));

        Share::create([
            'user_id' => $request->user()?->id,
            'shareable_type' => $modelClass,
            'shareable_id' => $entity->id,
            'channel' => $validated['channel'],
            'tracking_code' => $trackingCode,
        ]);

        $url = "{$baseUrl}/share/{$trackingCode}";

        return response()->json(['url' => $url, 'tracking_code' => $trackingCode]);
    }

    public function trackClick(string $trackingCode): RedirectResponse
    {
        $share = Share::where('tracking_code', $trackingCode)->first();

        if (! $share) {
            return redirect()->to('/');
        }

        $share->increment('click_count');

        $entity = $share->shareable;
        if (! $entity) {
            return redirect()->to('/');
        }

        $path = match (class_basename($entity)) {
            'Event' => "/events/{$entity->id}",
            'Performer' => "/performers/{$entity->id}",
            'Venue' => "/venues/{$entity->id}",
            default => '/',
        };

        return redirect()->to($path);
    }
}

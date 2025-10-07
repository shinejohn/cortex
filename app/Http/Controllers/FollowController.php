<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\Follow;
use App\Models\Performer;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class FollowController extends Controller
{
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'followable_type' => 'required|string|in:event,performer,venue,calendar',
            'followable_id' => 'required|string',
        ]);

        $followableType = match ($request->followable_type) {
            'event' => Event::class,
            'performer' => Performer::class,
            'venue' => Venue::class,
            'calendar' => Calendar::class,
        };

        $followable = $followableType::findOrFail($request->followable_id);

        $follow = Follow::where('user_id', $request->user()->id)
            ->where('followable_type', $followableType)
            ->where('followable_id', $followable->id)
            ->first();

        if ($follow) {
            $follow->delete();

            return response()->json([
                'following' => false,
                'message' => 'Unfollowed successfully',
            ]);
        }

        Follow::create([
            'user_id' => $request->user()->id,
            'followable_type' => $followableType,
            'followable_id' => $followable->id,
        ]);

        return response()->json([
            'following' => true,
            'message' => 'Followed successfully',
        ]);
    }

    public function checkStatus(Request $request): JsonResponse
    {
        $request->validate([
            'followable_type' => 'required|string|in:event,performer,venue,calendar',
            'followable_id' => 'required|string',
        ]);

        $followableType = match ($request->followable_type) {
            'event' => Event::class,
            'performer' => Performer::class,
            'venue' => Venue::class,
            'calendar' => Calendar::class,
        };

        $isFollowing = Follow::where('user_id', $request->user()->id)
            ->where('followable_type', $followableType)
            ->where('followable_id', $request->followable_id)
            ->exists();

        return response()->json([
            'following' => $isFollowing,
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CheckIn;
use App\Models\Event;
use App\Models\User;

final class CheckInService
{
    public function checkIn(User $user, Event $event, array $data = []): CheckIn
    {
        // Check if already checked in
        $existingCheckIn = CheckIn::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingCheckIn) {
            return $existingCheckIn;
        }

        $checkIn = CheckIn::create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'checked_in_at' => now(),
            'location' => $data['location'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'notes' => $data['notes'] ?? null,
            'is_public' => $data['is_public'] ?? true,
        ]);

        // Update event attendance
        $event->increment('member_attendance');

        return $checkIn;
    }

    public function removeCheckIn(CheckIn $checkIn): bool
    {
        $event = $checkIn->event;
        $deleted = $checkIn->delete();

        if ($deleted && $event) {
            $event->decrement('member_attendance');
        }

        return $deleted;
    }

    public function getEventCheckIns(Event $event, bool $publicOnly = true): \Illuminate\Database\Eloquent\Collection
    {
        $query = CheckIn::where('event_id', $event->id)
            ->with('user')
            ->recent(24)
            ->latest('checked_in_at');

        if ($publicOnly) {
            $query->public();
        }

        return $query->get();
    }

    public function getUserCheckIns(User $user, int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return CheckIn::where('user_id', $user->id)
            ->with(['event.venue'])
            ->latest('checked_in_at')
            ->limit($limit)
            ->get();
    }
}


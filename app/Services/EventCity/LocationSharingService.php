<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Events\EventCity\LocationShareStarted;
use App\Models\LocationShare;
use App\Models\User;

final class LocationSharingService
{
    /**
     * Start sharing location.
     */
    public function startSharing(
        User $user,
        float $lat,
        float $lng,
        ?string $eventId = null,
        ?string $groupId = null,
        int $durationMinutes = 60,
    ): LocationShare {
        $share = LocationShare::create([
            'user_id' => $user->id,
            'event_id' => $eventId,
            'group_id' => $groupId,
            'latitude' => $lat,
            'longitude' => $lng,
            'expires_at' => now()->addMinutes($durationMinutes),
        ]);

        event(new LocationShareStarted($share));

        return $share;
    }

    /**
     * Update a location share with new coordinates.
     */
    public function updateLocation(
        LocationShare $share,
        float $lat,
        float $lng,
        ?float $accuracy = null,
    ): LocationShare {
        $share->update([
            'latitude' => $lat,
            'longitude' => $lng,
            'accuracy_meters' => $accuracy,
        ]);

        return $share->refresh();
    }

    /**
     * Stop an active location share.
     */
    public function stopSharing(LocationShare $share): LocationShare
    {
        $share->stop();

        return $share->refresh();
    }

    /**
     * Clean up expired location shares.
     *
     * @return int Number of shares cleaned up
     */
    public function cleanupExpiredShares(): int
    {
        return LocationShare::query()
            ->whereNull('stopped_at')
            ->where('expires_at', '<', now())
            ->update(['stopped_at' => now()]);
    }
}

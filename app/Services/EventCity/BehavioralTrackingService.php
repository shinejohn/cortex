<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Events\EventCity\UserBehaviorRecorded;
use App\Models\User;
use App\Models\UserBehavioralEvent;
use Illuminate\Database\Eloquent\Collection;

final class BehavioralTrackingService
{
    /**
     * Record a behavioral event for an authenticated user.
     */
    public function recordEvent(
        User $user,
        string $type,
        ?string $contentType = null,
        ?string $contentId = null,
        ?string $category = null,
        array $context = [],
    ): UserBehavioralEvent {
        $event = UserBehavioralEvent::create([
            'user_id' => $user->id,
            'session_id' => session()->getId(),
            'event_type' => $type,
            'content_type' => $contentType,
            'content_id' => $contentId,
            'category' => $category,
            'context' => $context,
            'device_type' => $this->detectDeviceType(),
            'occurred_at' => now(),
        ]);

        event(new UserBehaviorRecorded($event));

        return $event;
    }

    /**
     * Record a behavioral event for an anonymous session.
     */
    public function recordAnonymousEvent(
        string $sessionId,
        string $type,
        array $context = [],
    ): UserBehavioralEvent {
        return UserBehavioralEvent::create([
            'user_id' => null,
            'session_id' => $sessionId,
            'event_type' => $type,
            'content_type' => $context['content_type'] ?? null,
            'content_id' => $context['content_id'] ?? null,
            'category' => $context['category'] ?? null,
            'context' => $context,
            'device_type' => $this->detectDeviceType(),
            'occurred_at' => now(),
        ]);
    }

    /**
     * Get recent behavioral events for a user.
     *
     * @return Collection<int, UserBehavioralEvent>
     */
    public function getRecentBehavior(User $user, int $days = 30): Collection
    {
        return UserBehavioralEvent::query()
            ->forUser($user->id)
            ->recent($days)
            ->orderByDesc('occurred_at')
            ->get();
    }

    /**
     * Detect device type from the request user agent.
     */
    private function detectDeviceType(): ?string
    {
        $userAgent = request()->userAgent();

        if ($userAgent === null) {
            return null;
        }

        if (preg_match('/Mobile|Android|iPhone|iPad/i', $userAgent)) {
            if (preg_match('/iPad|Tablet/i', $userAgent)) {
                return 'tablet';
            }

            return 'mobile';
        }

        return 'desktop';
    }
}

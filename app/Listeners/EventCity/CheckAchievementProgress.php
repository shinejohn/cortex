<?php

declare(strict_types=1);

namespace App\Listeners\EventCity;

use App\Events\EventCity\UserBehaviorRecorded;
use App\Services\EventCity\AchievementBridgeService;

final class CheckAchievementProgress
{
    public function __construct(
        private readonly AchievementBridgeService $achievementService
    ) {}

    public function handle(UserBehaviorRecorded $event): void
    {
        $behavioralEvent = $event->behavioralEvent;

        if ($behavioralEvent->user_id === null) {
            return;
        }

        $user = $behavioralEvent->user;

        if (! $user) {
            return;
        }

        $eventType = $behavioralEvent->event_type;

        $progressionMap = [
            'event_view' => ['first_event', 'event_explorer_5', 'event_explorer_25'],
            'ticket_purchase' => ['first_ticket', 'big_spender'],
            'share' => ['event_sharer'],
        ];

        $slugs = $progressionMap[$eventType] ?? [];

        foreach ($slugs as $slug) {
            $this->achievementService->checkAndProgress($user, $slug);
        }

        if ($behavioralEvent->category !== null) {
            $this->achievementService->checkAndProgress($user, 'category_hopper');
        }
    }
}

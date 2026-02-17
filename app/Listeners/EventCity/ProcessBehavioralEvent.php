<?php

declare(strict_types=1);

namespace App\Listeners\EventCity;

use App\Events\EventCity\UserBehaviorRecorded;
use App\Services\EventCity\AchievementBridgeService;

final class ProcessBehavioralEvent
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

        $achievementMap = [
            'event_view' => 'first_event',
            'ticket_purchase' => 'first_ticket',
            'share' => 'event_sharer',
        ];

        $achievementSlug = $achievementMap[$behavioralEvent->event_type] ?? null;

        if ($achievementSlug) {
            $this->achievementService->checkAndProgress($user, $achievementSlug);
        }
    }
}

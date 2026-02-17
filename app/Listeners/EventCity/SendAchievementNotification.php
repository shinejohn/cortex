<?php

declare(strict_types=1);

namespace App\Listeners\EventCity;

use App\Events\EventCity\AchievementUnlocked;
use App\Notifications\EventCity\AchievementUnlockedNotification;

final class SendAchievementNotification
{
    public function handle(AchievementUnlocked $event): void
    {
        $user = $event->achievement->user;

        if ($user) {
            $user->notify(new AchievementUnlockedNotification($event->achievement));
        }
    }
}

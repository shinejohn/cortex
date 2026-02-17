<?php

declare(strict_types=1);

namespace App\Notifications\EventCity;

use App\Models\UserAchievementProgress;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

final class AchievementUnlockedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly UserAchievementProgress $achievement
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'achievement_slug' => $this->achievement->achievement_slug,
            'category' => $this->achievement->category,
            'points_awarded' => $this->achievement->points_awarded,
        ];
    }
}

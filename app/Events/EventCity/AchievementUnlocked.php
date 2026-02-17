<?php

declare(strict_types=1);

namespace App\Events\EventCity;

use App\Models\UserAchievementProgress;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class AchievementUnlocked
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly UserAchievementProgress $achievement
    ) {}
}

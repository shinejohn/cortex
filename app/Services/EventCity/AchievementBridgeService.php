<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Events\EventCity\AchievementUnlocked;
use App\Models\User;
use App\Models\UserAchievementProgress;
use Illuminate\Database\Eloquent\Collection;

final class AchievementBridgeService
{
    /**
     * Check and progress an achievement for a user.
     */
    public function checkAndProgress(User $user, string $achievementSlug, int $incrementBy = 1): ?UserAchievementProgress
    {
        $definition = collect($this->getAchievementDefinitions())
            ->firstWhere('slug', $achievementSlug);

        if (! $definition) {
            return null;
        }

        $progress = UserAchievementProgress::firstOrCreate(
            ['user_id' => $user->id, 'achievement_slug' => $achievementSlug],
            [
                'category' => $definition['category'],
                'current_progress' => 0,
                'target_value' => $definition['target'],
                'points_awarded' => 0,
            ]
        );

        if ($progress->isCompleted()) {
            return $progress;
        }

        $progress->incrementProgress($incrementBy);

        if ($progress->current_progress >= $progress->target_value && ! $progress->isCompleted()) {
            $progress->update([
                'completed_at' => now(),
                'points_awarded' => $definition['points'],
            ]);

            $progress->refresh();

            event(new AchievementUnlocked($progress));
        }

        return $progress;
    }

    /**
     * Get all achievement definitions.
     *
     * @return array<int, array{slug: string, name: string, description: string, category: string, target: int, points: int}>
     */
    public function getAchievementDefinitions(): array
    {
        return [
            [
                'slug' => 'first_event',
                'name' => 'First Steps',
                'description' => 'Attend your first event',
                'category' => 'explorer',
                'target' => 1,
                'points' => 10,
            ],
            [
                'slug' => 'event_explorer_5',
                'name' => 'Event Explorer',
                'description' => 'Attend 5 different events',
                'category' => 'explorer',
                'target' => 5,
                'points' => 25,
            ],
            [
                'slug' => 'event_explorer_25',
                'name' => 'Event Veteran',
                'description' => 'Attend 25 different events',
                'category' => 'explorer',
                'target' => 25,
                'points' => 100,
            ],
            [
                'slug' => 'category_hopper',
                'name' => 'Category Hopper',
                'description' => 'Explore events in 5 different categories',
                'category' => 'explorer',
                'target' => 5,
                'points' => 30,
            ],
            [
                'slug' => 'social_butterfly',
                'name' => 'Social Butterfly',
                'description' => 'Connect with 10 friends',
                'category' => 'social',
                'target' => 10,
                'points' => 50,
            ],
            [
                'slug' => 'group_creator',
                'name' => 'Group Leader',
                'description' => 'Create 3 social groups',
                'category' => 'social',
                'target' => 3,
                'points' => 30,
            ],
            [
                'slug' => 'event_sharer',
                'name' => 'Event Sharer',
                'description' => 'Share 10 events with friends',
                'category' => 'social',
                'target' => 10,
                'points' => 40,
            ],
            [
                'slug' => 'location_sharer',
                'name' => 'Location Beacon',
                'description' => 'Share your location at 5 events',
                'category' => 'social',
                'target' => 5,
                'points' => 25,
            ],
            [
                'slug' => 'first_ticket',
                'name' => 'First Ticket',
                'description' => 'Purchase your first ticket',
                'category' => 'supporter',
                'target' => 1,
                'points' => 15,
            ],
            [
                'slug' => 'big_spender',
                'name' => 'Big Supporter',
                'description' => 'Purchase 10 tickets',
                'category' => 'supporter',
                'target' => 10,
                'points' => 75,
            ],
            [
                'slug' => 'tip_giver',
                'name' => 'Generous Tipper',
                'description' => 'Send 5 tips to performers',
                'category' => 'supporter',
                'target' => 5,
                'points' => 35,
            ],
            [
                'slug' => 'reviewer',
                'name' => 'Critic',
                'description' => 'Leave 10 event reviews',
                'category' => 'supporter',
                'target' => 10,
                'points' => 45,
            ],
        ];
    }

    /**
     * Get all achievement progress records for a user.
     *
     * @return Collection<int, UserAchievementProgress>
     */
    public function getUserAchievements(User $user): Collection
    {
        return UserAchievementProgress::query()
            ->where('user_id', $user->id)
            ->orderBy('category')
            ->orderByDesc('completed_at')
            ->get();
    }
}

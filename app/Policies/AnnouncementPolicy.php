<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;

final class AnnouncementPolicy
{
    /**
     * Determine if the user can update the announcement.
     */
    public function update(User $user, Announcement $announcement): bool
    {
        return $user->id === $announcement->user_id;
    }

    /**
     * Determine if the user can delete the announcement.
     */
    public function delete(User $user, Announcement $announcement): bool
    {
        return $user->id === $announcement->user_id || $user->can('moderate', Announcement::class);
    }
}


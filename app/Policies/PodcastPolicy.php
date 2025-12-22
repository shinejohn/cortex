<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Podcast;
use App\Models\User;

final class PodcastPolicy
{
    /**
     * Determine if the user can update the podcast.
     */
    public function update(User $user, Podcast $podcast): bool
    {
        return $podcast->creator && $podcast->creator->user_id === $user->id;
    }

    /**
     * Determine if the user can delete the podcast.
     */
    public function delete(User $user, Podcast $podcast): bool
    {
        return ($podcast->creator && $podcast->creator->user_id === $user->id) || $user->can('moderate', Podcast::class);
    }
}


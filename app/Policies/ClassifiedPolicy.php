<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Classified;
use App\Models\User;

final class ClassifiedPolicy
{
    /**
     * Determine if the user can update the classified.
     */
    public function update(User $user, Classified $classified): bool
    {
        return $user->id === $classified->user_id;
    }

    /**
     * Determine if the user can delete the classified.
     */
    public function delete(User $user, Classified $classified): bool
    {
        return $user->id === $classified->user_id || $user->can('moderate', Classified::class);
    }
}


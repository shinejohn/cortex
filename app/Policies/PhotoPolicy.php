<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Photo;
use App\Models\User;

final class PhotoPolicy
{
    /**
     * Determine if the user can delete the photo.
     */
    public function delete(User $user, Photo $photo): bool
    {
        return $user->id === $photo->user_id || $user->can('moderate', Photo::class);
    }
}


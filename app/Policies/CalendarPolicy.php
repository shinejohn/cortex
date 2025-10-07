<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Calendar;
use App\Models\User;

final class CalendarPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Calendar $calendar): bool
    {
        if (! $calendar->is_private) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        return $calendar->user_id === $user->id ||
               $calendar->editors()->where('user_id', $user->id)->exists() ||
               $calendar->followers()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Calendar $calendar): bool
    {
        return $calendar->user_id === $user->id ||
               $calendar->editors()->where('user_id', $user->id)->exists();
    }

    public function delete(User $user, Calendar $calendar): bool
    {
        return $calendar->user_id === $user->id;
    }

    public function restore(User $user, Calendar $calendar): bool
    {
        return $calendar->user_id === $user->id;
    }

    public function forceDelete(User $user, Calendar $calendar): bool
    {
        return $calendar->user_id === $user->id;
    }
}

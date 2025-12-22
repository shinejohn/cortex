<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CheckIn;
use App\Models\User;

final class CheckInPolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Public check-ins are viewable
    }

    public function view(?User $user, CheckIn $checkIn): bool
    {
        // Public check-ins are viewable by anyone
        if ($checkIn->is_public) {
            return true;
        }

        // Private check-ins only viewable by the user or event organizer
        if (!$user) {
            return false;
        }

        return $checkIn->user_id === $user->id || $checkIn->event->created_by === $user->id;
    }

    public function create(User $user): bool
    {
        return true; // Any authenticated user can check in
    }

    public function update(User $user, CheckIn $checkIn): bool
    {
        return $checkIn->user_id === $user->id;
    }

    public function delete(User $user, CheckIn $checkIn): bool
    {
        return $checkIn->user_id === $user->id || $checkIn->event->created_by === $user->id;
    }
}

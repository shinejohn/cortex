<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\SocialGroup;
use App\Models\User;

final class SocialGroupPolicy
{
    public function viewAny(?User $user): bool
    {
        return $user !== null;
    }

    public function view(?User $user, SocialGroup $group): bool
    {
        if (! $user) {
            return $group->isPublic();
        }

        return match ($group->privacy) {
            'public' => true,
            'private' => true, // Can view private groups but may not be able to join
            'secret' => $user->isMemberOfGroup($group),
            default => false,
        };
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SocialGroup $group): bool
    {
        $membership = $group->members()->where('user_id', $user->id)->first();

        return $membership && $membership->isAdmin();
    }

    public function delete(User $user, SocialGroup $group): bool
    {
        return $user->id === $group->creator_id;
    }

    public function join(User $user, SocialGroup $group): bool
    {
        if ($user->isMemberOfGroup($group)) {
            return false;
        }

        return match ($group->privacy) {
            'public' => true,
            'private' => true, // Can request to join
            'secret' => false, // Cannot join secret groups without invitation
            default => false,
        };
    }

    public function leave(User $user, SocialGroup $group): bool
    {
        $membership = $group->members()->where('user_id', $user->id)->first();

        if (! $membership) {
            return false;
        }

        // Cannot leave if you're the only admin
        if ($membership->isAdmin() && $group->admins()->count() === 1) {
            return false;
        }

        return true;
    }

    public function invite(User $user, SocialGroup $group): bool
    {
        $membership = $group->members()->where('user_id', $user->id)->first();

        return $membership && ($membership->isAdmin() || $membership->isModerator());
    }

    public function manageMember(User $user, SocialGroup $group): bool
    {
        $membership = $group->members()->where('user_id', $user->id)->first();

        return $membership && ($membership->isAdmin() || $membership->isModerator());
    }

    public function createPost(User $user, SocialGroup $group): bool
    {
        $membership = $group->members()->where('user_id', $user->id)->first();

        return $membership && $membership->isApproved();
    }
}

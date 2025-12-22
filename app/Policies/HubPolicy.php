<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Hub;
use App\Models\HubMember;
use App\Models\User;

final class HubPolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Public listing
    }

    public function view(?User $user, Hub $hub): bool
    {
        // Published and active hubs are publicly viewable
        if ($hub->is_active && $hub->published_at && $hub->published_at->isPast()) {
            return true;
        }

        // Unpublished hubs require membership
        if (!$user) {
            return false;
        }

        return $hub->members()->where('user_id', $user->id)->active()->exists();
    }

    public function create(User $user): bool
    {
        $workspace = $user->currentWorkspace ?? $user->workspaces->first();
        return $workspace !== null;
    }

    public function update(User $user, Hub $hub): bool
    {
        $member = $hub->members()->where('user_id', $user->id)->active()->first();
        
        if (!$member) {
            return false;
        }

        return $member->canEdit();
    }

    public function delete(User $user, Hub $hub): bool
    {
        $member = $hub->members()->where('user_id', $user->id)->active()->first();
        
        if (!$member) {
            return false;
        }

        return $member->canManage();
    }
}

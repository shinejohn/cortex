<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Community;
use App\Models\User;

final class CommunityPolicy
{
    /**
     * Determine whether the user can view any models.
     * This is for the admin index view, requires workspace management permissions.
     */
    public function viewAny(User $user): bool
    {
        $workspace = $user->currentWorkspace;

        if (! $workspace) {
            return false;
        }

        return $user->hasSomePermissions(['workspace.read'], $workspace->id);
    }

    /**
     * Determine whether the user can view the model.
     * Communities are publicly viewable when active.
     */
    public function view(?User $user, Community $community): bool
    {
        // Active communities are publicly viewable
        if ($community->is_active) {
            return true;
        }

        // Inactive communities require authentication and workspace access
        if (! $user) {
            return false;
        }

        return $user->isMemberOfWorkspace($community->workspace_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        $workspace = $user->currentWorkspace;

        if (! $workspace) {
            return false;
        }

        // Admins and above can create communities
        return $user->hasSomePermissions(['workspace.update'], $workspace->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Community $community): bool
    {
        // Must be a member of the community's workspace
        if (! $user->isMemberOfWorkspace($community->workspace_id)) {
            return false;
        }

        // Community creator can always update their own communities
        if ($community->created_by === $user->id) {
            return true;
        }

        // Admin+ can update any community in their workspace
        return $user->hasSomePermissions(['workspace.update'], $community->workspace_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Community $community): bool
    {
        // Must be a member of the community's workspace
        if (! $user->isMemberOfWorkspace($community->workspace_id)) {
            return false;
        }

        // Community creator can always delete their own communities
        if ($community->created_by === $user->id) {
            return true;
        }

        // Admin+ can delete any community in their workspace
        return $user->hasSomePermissions(['workspace.update'], $community->workspace_id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Community $community): bool
    {
        return $this->delete($user, $community);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Community $community): bool
    {
        // Only workspace admins+ can permanently delete
        return $user->hasSomePermissions(['workspace.update'], $community->workspace_id);
    }
}

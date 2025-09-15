<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Performer;
use App\Models\User;

final class PerformerPolicy
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
     * Performers are publicly viewable when active.
     */
    public function view(?User $user, Performer $performer): bool
    {
        // Active performers are publicly viewable
        if ($performer->status === 'active') {
            return true;
        }

        // Inactive performers require authentication and workspace access
        if (! $user) {
            return false;
        }

        return $user->isMemberOfWorkspace($performer->workspace_id);
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

        // Members and above can create performers
        return $user->hasSomePermissions(['workspace.read'], $workspace->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Performer $performer): bool
    {
        // Must be a member of the performer's workspace
        if (! $user->isMemberOfWorkspace($performer->workspace_id)) {
            return false;
        }

        // Performer creator can always update their own performers
        if ($performer->created_by === $user->id) {
            return true;
        }

        // Admin+ can update any performer in their workspace
        return $user->hasSomePermissions(['workspace.update'], $performer->workspace_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Performer $performer): bool
    {
        // Must be a member of the performer's workspace
        if (! $user->isMemberOfWorkspace($performer->workspace_id)) {
            return false;
        }

        // Performer creator can always delete their own performers
        if ($performer->created_by === $user->id) {
            return true;
        }

        // Admin+ can delete any performer in their workspace
        return $user->hasSomePermissions(['workspace.update'], $performer->workspace_id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Performer $performer): bool
    {
        return $this->delete($user, $performer);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Performer $performer): bool
    {
        // Only workspace admins+ can permanently delete
        return $user->hasSomePermissions(['workspace.update'], $performer->workspace_id);
    }
}

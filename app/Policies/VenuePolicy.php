<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\Venue;

final class VenuePolicy
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
     * Venues are publicly viewable when active.
     */
    public function view(?User $user, Venue $venue): bool
    {
        // Active venues are publicly viewable
        if ($venue->status === 'active') {
            return true;
        }

        // Inactive venues require authentication and workspace access
        if (! $user) {
            return false;
        }

        return $user->isMemberOfWorkspace($venue->workspace_id);
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

        // Members and above can create venues
        return $user->hasSomePermissions(['workspace.read'], $workspace->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Venue $venue): bool
    {
        // Must be a member of the venue's workspace
        if (! $user->isMemberOfWorkspace($venue->workspace_id)) {
            return false;
        }

        // Venue creator can always update their own venues
        if ($venue->created_by === $user->id) {
            return true;
        }

        // Admin+ can update any venue in their workspace
        return $user->hasSomePermissions(['workspace.update'], $venue->workspace_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Venue $venue): bool
    {
        // Must be a member of the venue's workspace
        if (! $user->isMemberOfWorkspace($venue->workspace_id)) {
            return false;
        }

        // Venue creator can always delete their own venues
        if ($venue->created_by === $user->id) {
            return true;
        }

        // Admin+ can delete any venue in their workspace
        return $user->hasSomePermissions(['workspace.update'], $venue->workspace_id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Venue $venue): bool
    {
        return $this->delete($user, $venue);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Venue $venue): bool
    {
        // Only workspace admins+ can permanently delete
        return $user->hasSomePermissions(['workspace.update'], $venue->workspace_id);
    }
}

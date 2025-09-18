<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CommunityThread;
use App\Models\User;

final class CommunityThreadPolicy
{
    /**
     * Determine whether the user can view any models.
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
     * Threads are publicly viewable if the community is active.
     */
    public function view(?User $user, CommunityThread $communityThread): bool
    {
        // Threads are viewable if the community is active
        if ($communityThread->community->is_active) {
            return true;
        }

        // If community is inactive, require authentication and workspace access
        if (! $user) {
            return false;
        }

        return $user->isMemberOfWorkspace($communityThread->community->workspace_id);
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

        // Members and above can create threads
        return $user->hasSomePermissions(['workspace.read'], $workspace->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CommunityThread $communityThread): bool
    {
        // Must be a member of the thread's community workspace
        if (! $user->isMemberOfWorkspace($communityThread->community->workspace_id)) {
            return false;
        }

        // Thread author can always update their own threads (unless locked)
        if ($communityThread->author_id === $user->id && ! $communityThread->is_locked) {
            return true;
        }

        // Admin+ can update any thread in their workspace
        return $user->hasSomePermissions(['workspace.update'], $communityThread->community->workspace_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CommunityThread $communityThread): bool
    {
        // Must be a member of the thread's community workspace
        if (! $user->isMemberOfWorkspace($communityThread->community->workspace_id)) {
            return false;
        }

        // Thread author can always delete their own threads
        if ($communityThread->author_id === $user->id) {
            return true;
        }

        // Admin+ can delete any thread in their workspace
        return $user->hasSomePermissions(['workspace.update'], $communityThread->community->workspace_id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CommunityThread $communityThread): bool
    {
        return $this->delete($user, $communityThread);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CommunityThread $communityThread): bool
    {
        // Only workspace admins+ can permanently delete
        return $user->hasSomePermissions(['workspace.update'], $communityThread->community->workspace_id);
    }
}

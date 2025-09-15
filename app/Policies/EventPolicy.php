<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

final class EventPolicy
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
     * Events are publicly viewable when published, auth required for drafts.
     */
    public function view(?User $user, Event $event): bool
    {
        // Published events are publicly viewable
        if ($event->status === 'published') {
            return true;
        }

        // Draft/unpublished events require authentication and workspace access
        if (! $user) {
            return false;
        }

        return $user->isMemberOfWorkspace($event->workspace_id);
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

        // Members and above can create events
        return $user->hasSomePermissions(['workspace.read'], $workspace->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Event $event): bool
    {
        // Must be a member of the event's workspace
        if (! $user->isMemberOfWorkspace($event->workspace_id)) {
            return false;
        }

        // Event creator can always update their own events
        if ($event->created_by === $user->id) {
            return true;
        }

        // Admin+ can update any event in their workspace
        return $user->hasSomePermissions(['workspace.update'], $event->workspace_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Event $event): bool
    {
        // Must be a member of the event's workspace
        if (! $user->isMemberOfWorkspace($event->workspace_id)) {
            return false;
        }

        // Event creator can always delete their own events
        if ($event->created_by === $user->id) {
            return true;
        }

        // Admin+ can delete any event in their workspace
        return $user->hasSomePermissions(['workspace.update'], $event->workspace_id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Event $event): bool
    {
        return $this->delete($user, $event);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Event $event): bool
    {
        // Only workspace admins+ can permanently delete
        return $user->hasSomePermissions(['workspace.update'], $event->workspace_id);
    }
}

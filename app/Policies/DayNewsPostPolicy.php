<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\DayNewsPost;
use App\Models\User;

final class DayNewsPostPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->current_workspace_id !== null;
    }

    public function view(User $user, DayNewsPost $dayNewsPost): bool
    {
        return $dayNewsPost->workspace_id === $user->current_workspace_id
            || $dayNewsPost->author_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->current_workspace_id !== null;
    }

    public function update(User $user, DayNewsPost $dayNewsPost): bool
    {
        if ($dayNewsPost->status !== 'draft') {
            return false;
        }

        return $dayNewsPost->workspace_id === $user->current_workspace_id
            && ($dayNewsPost->author_id === $user->id || $user->isMemberOfWorkspace($dayNewsPost->workspace_id));
    }

    public function delete(User $user, DayNewsPost $dayNewsPost): bool
    {
        if ($dayNewsPost->status === 'published' && $dayNewsPost->payment?->isPaid()) {
            return false;
        }

        return $dayNewsPost->workspace_id === $user->current_workspace_id
            && ($dayNewsPost->author_id === $user->id || $user->isOwnerOfWorkspace($dayNewsPost->workspace_id));
    }

    public function publish(User $user, DayNewsPost $dayNewsPost): bool
    {
        if ($dayNewsPost->status !== 'draft') {
            return false;
        }

        return $dayNewsPost->workspace_id === $user->current_workspace_id
            && ($dayNewsPost->author_id === $user->id || $user->isMemberOfWorkspace($dayNewsPost->workspace_id));
    }
}

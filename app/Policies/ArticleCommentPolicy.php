<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ArticleComment;
use App\Models\User;

final class ArticleCommentPolicy
{
    /**
     * Determine if the user can update the comment.
     */
    public function update(User $user, ArticleComment $comment): bool
    {
        return $user->id === $comment->user_id;
    }

    /**
     * Determine if the user can delete the comment.
     */
    public function delete(User $user, ArticleComment $comment): bool
    {
        return $user->id === $comment->user_id || $user->can('moderate', ArticleComment::class);
    }

    /**
     * Determine if the user can moderate comments.
     */
    public function moderate(User $user): bool
    {
        // TODO: Check if user has admin/moderator role
        return $user->hasRole('admin') || $user->hasRole('moderator');
    }
}


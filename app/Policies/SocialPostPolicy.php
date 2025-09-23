<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\SocialPost;
use App\Models\User;

final class SocialPostPolicy
{
    public function viewAny(?User $user): bool
    {
        return $user !== null;
    }

    public function view(?User $user, SocialPost $post): bool
    {
        if (! $user) {
            return $post->visibility === 'public';
        }

        // Owner can always view
        if ($post->user_id === $user->id) {
            return true;
        }

        return match ($post->visibility) {
            'public' => true,
            'friends' => $user->isFriendsWith($post->user),
            'private' => false,
            default => false,
        };
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SocialPost $post): bool
    {
        return $user->id === $post->user_id;
    }

    public function delete(User $user, SocialPost $post): bool
    {
        return $user->id === $post->user_id;
    }

    public function like(User $user, SocialPost $post): bool
    {
        return $this->view($user, $post);
    }

    public function comment(User $user, SocialPost $post): bool
    {
        return $this->view($user, $post);
    }

    public function share(User $user, SocialPost $post): bool
    {
        return $this->view($user, $post) && $post->visibility !== 'private';
    }
}

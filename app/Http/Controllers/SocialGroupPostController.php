<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\SocialGroup;
use App\Models\SocialGroupPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class SocialGroupPostController extends Controller
{
    public function index(SocialGroup $group): Response
    {
        $user = Auth::user();

        if ($group->isSecret() && ! $user->isMemberOfGroup($group)) {
            abort(404);
        }

        $posts = $group->posts()
            ->with(['user', 'group'])
            ->where('is_active', true)
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('event-city/social/groups/posts', [
            'group' => [
                ...$group->toArray(),
                'user_membership' => $group->members()->where('user_id', $user->id)->first(),
            ],
            'posts' => $posts,
        ]);
    }

    public function store(SocialGroup $group, Request $request): JsonResponse
    {
        $user = Auth::user();

        if (! $user->isMemberOfGroup($group)) {
            return response()->json(['error' => 'You must be a group member to post'], 403);
        }

        $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'media' => ['nullable', 'array'],
            'media.*' => ['string', 'url'],
        ]);

        $post = SocialGroupPost::create([
            'group_id' => $group->id,
            'user_id' => $user->id,
            'content' => $request->content,
            'media' => $request->media,
            'is_active' => true,
        ]);

        $post->load(['user', 'group']);

        return response()->json([
            'message' => 'Post created successfully',
            'post' => $post,
        ]);
    }

    public function show(SocialGroup $group, SocialGroupPost $post): Response
    {
        $user = Auth::user();

        if ($group->isSecret() && ! $user->isMemberOfGroup($group)) {
            abort(404);
        }

        if ($post->group_id !== $group->id) {
            abort(404);
        }

        $post->load(['user', 'group']);

        return Inertia::render('event-city/social/groups/post-show', [
            'group' => [
                ...$group->toArray(),
                'user_membership' => $group->members()->where('user_id', $user->id)->first(),
            ],
            'post' => $post,
        ]);
    }

    public function update(SocialGroup $group, SocialGroupPost $post, Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($post->user_id !== $user->id) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        if ($post->group_id !== $group->id) {
            return response()->json(['error' => 'Invalid group'], 400);
        }

        $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'media' => ['nullable', 'array'],
            'media.*' => ['string', 'url'],
        ]);

        $post->update([
            'content' => $request->content,
            'media' => $request->media,
        ]);

        $post->load(['user', 'group']);

        return response()->json([
            'message' => 'Post updated successfully',
            'post' => $post,
        ]);
    }

    public function destroy(SocialGroup $group, SocialGroupPost $post): JsonResponse
    {
        $user = Auth::user();

        $membership = $group->members()->where('user_id', $user->id)->first();

        if ($post->user_id !== $user->id && (! $membership || ! in_array($membership->role, ['admin', 'moderator']))) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        if ($post->group_id !== $group->id) {
            return response()->json(['error' => 'Invalid group'], 400);
        }

        $post->update(['is_active' => false]);

        return response()->json(['message' => 'Post deleted successfully']);
    }

    public function pin(SocialGroup $group, SocialGroupPost $post): JsonResponse
    {
        $user = Auth::user();

        $membership = $group->members()->where('user_id', $user->id)->first();
        if (! $membership || ! in_array($membership->role, ['admin', 'moderator'])) {
            return response()->json(['error' => 'No permission to pin posts'], 403);
        }

        if ($post->group_id !== $group->id) {
            return response()->json(['error' => 'Invalid group'], 400);
        }

        $post->update(['is_pinned' => ! $post->is_pinned]);

        $action = $post->is_pinned ? 'pinned' : 'unpinned';

        return response()->json(['message' => "Post {$action} successfully"]);
    }
}

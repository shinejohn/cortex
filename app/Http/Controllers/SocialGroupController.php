<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Social\CreateGroupRequest;
use App\Models\SocialGroup;
use App\Models\SocialGroupMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class SocialGroupController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $myGroups = SocialGroup::whereHas('members', function ($query) use ($user) {
            $query->where('user_id', $user->id)->where('status', 'approved');
        })->with(['creator', 'members'])->get();

        $suggestedGroups = SocialGroup::where('privacy', 'public')
            ->whereDoesntHave('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->limit(10)
            ->get();

        return Inertia::render('social/groups/index', [
            'my_groups' => $myGroups,
            'suggested_groups' => $suggestedGroups,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('social/groups/create');
    }

    public function store(CreateGroupRequest $request): JsonResponse
    {
        $user = Auth::user();

        $group = SocialGroup::create([
            'name' => $request->name,
            'description' => $request->description,
            'privacy' => $request->privacy,
            'cover_image' => $request->cover_image,
            'creator_id' => $user->id,
        ]);

        // Add creator as admin member
        SocialGroupMember::create([
            'group_id' => $group->id,
            'user_id' => $user->id,
            'role' => 'admin',
            'status' => 'approved',
        ]);

        return response()->json([
            'message' => 'Group created successfully',
            'group' => $group,
        ]);
    }

    public function show(SocialGroup $group): Response
    {
        $user = Auth::user();

        // Check if user can view this group
        if ($group->isSecret() && ! $user->isMemberOfGroup($group)) {
            abort(404);
        }

        $group->load(['creator', 'members.user']);

        return Inertia::render('social/groups/show', [
            'group' => [
                ...$group->toArray(),
                'members_count' => $group->membersCount(),
                'user_membership' => $group->members()->where('user_id', $user->id)->first(),
            ],
        ]);
    }

    public function join(SocialGroup $group): JsonResponse
    {
        $user = Auth::user();

        if ($user->isMemberOfGroup($group)) {
            return response()->json(['error' => 'Already a member'], 400);
        }

        $status = $group->isPublic() ? 'approved' : 'pending';

        SocialGroupMember::create([
            'group_id' => $group->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => $status,
        ]);

        $message = $status === 'approved' ? 'Joined group successfully' : 'Join request sent';

        return response()->json(['message' => $message]);
    }

    public function leave(SocialGroup $group): JsonResponse
    {
        $user = Auth::user();

        $membership = $group->members()->where('user_id', $user->id)->first();

        if (! $membership) {
            return response()->json(['error' => 'Not a member'], 400);
        }

        if ($membership->isAdmin() && $group->admins()->count() === 1) {
            return response()->json(['error' => 'Cannot leave as the only admin'], 400);
        }

        $membership->delete();

        return response()->json(['message' => 'Left group successfully']);
    }
}

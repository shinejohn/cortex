<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Social\CreateGroupRequest;
use App\Models\SocialGroup;
use App\Models\SocialGroupInvitation;
use App\Models\SocialGroupMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        })
            ->with(['creator', 'members'])
            ->withCount('approvedMembers')
            ->get()
            ->map(function ($group) {
                return [
                    ...$group->toArray(),
                    'members_count' => $group->approved_members_count,
                    'href' => route('social.groups.show', $group->id),
                ];
            });

        $suggestedGroups = SocialGroup::where('privacy', 'public')
            ->where('is_active', true)
            ->whereDoesntHave('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['creator'])
            ->withCount('approvedMembers')
            ->orderByDesc('approved_members_count')
            ->limit(20)
            ->get()
            ->map(function ($group) {
                return [
                    ...$group->toArray(),
                    'members_count' => $group->approved_members_count,
                    'href' => route('social.groups.show', $group->id),
                ];
            });

        return Inertia::render('social/groups-index', [
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

    public function invite(SocialGroup $group, Request $request): JsonResponse
    {
        $user = Auth::user();

        $membership = $group->members()->where('user_id', $user->id)->first();
        if (! $membership || ! in_array($membership->role, ['admin', 'moderator'])) {
            return response()->json(['error' => 'No permission to invite users'], 403);
        }

        $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['required', 'uuid', 'exists:users,id'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $invitedCount = 0;
        foreach ($request->user_ids as $userId) {
            if ($userId === $user->id) {
                continue;
            }

            $targetUser = User::find($userId);
            if (! $targetUser || $targetUser->isMemberOfGroup($group)) {
                continue;
            }

            $existingInvitation = SocialGroupInvitation::where('group_id', $group->id)
                ->where('invited_id', $userId)
                ->pending()
                ->notExpired()
                ->first();

            if ($existingInvitation) {
                continue;
            }

            SocialGroupInvitation::create([
                'group_id' => $group->id,
                'inviter_id' => $user->id,
                'invited_id' => $userId,
                'message' => $request->message,
                'expires_at' => now()->addDays(7),
            ]);

            $invitedCount++;
        }

        return response()->json([
            'message' => "Invited {$invitedCount} user(s) to the group",
            'invited_count' => $invitedCount,
        ]);
    }

    public function respondToInvitation(SocialGroupInvitation $invitation, Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($invitation->invited_id !== $user->id) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        if (! $invitation->isPending() || $invitation->isExpired()) {
            return response()->json(['error' => 'Invalid invitation'], 400);
        }

        $request->validate([
            'action' => ['required', 'in:accept,decline'],
        ]);

        if ($request->action === 'accept') {
            $invitation->update(['status' => 'accepted']);

            SocialGroupMember::create([
                'group_id' => $invitation->group_id,
                'user_id' => $user->id,
                'role' => 'member',
                'status' => 'approved',
                'joined_at' => now(),
            ]);

            return response()->json(['message' => 'Invitation accepted']);
        }
        $invitation->update(['status' => 'declined']);

        return response()->json(['message' => 'Invitation declined']);

    }

    public function searchUsers(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (mb_strlen($query) < 2) {
            return response()->json(['users' => []]);
        }

        $users = User::where('name', 'ILIKE', "%{$query}%")
            ->orWhere('email', 'ILIKE', "%{$query}%")
            ->select(['id', 'name', 'email'])
            ->limit(10)
            ->get();

        return response()->json(['users' => $users]);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\SocialGroup;
use App\Models\SocialGroupMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EventGroupController extends Controller
{
    /**
     * Create a social group for a specific event.
     */
    public function store(Event $event, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'privacy' => ['nullable', 'string', 'in:public,private,secret'],
        ]);

        $group = SocialGroup::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'creator_id' => $request->user()->id,
            'event_id' => $event->id,
            'privacy' => $validated['privacy'] ?? 'public',
            'is_active' => true,
        ]);

        SocialGroupMember::create([
            'group_id' => $group->id,
            'user_id' => $request->user()->id,
            'role' => 'admin',
            'status' => 'approved',
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'group' => $group->load('creator'),
        ], 201);
    }

    /**
     * List all groups for a specific event.
     */
    public function index(Event $event, Request $request): JsonResponse
    {
        $groups = SocialGroup::query()
            ->where('event_id', $event->id)
            ->where('is_active', true)
            ->withCount('approvedMembers as members_count')
            ->with('creator:id,name')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'groups' => $groups,
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Hub;
use App\Models\HubMember;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

final class HubService
{
    public function createHub(User $user, Workspace $workspace, array $data): Hub
    {
        return DB::transaction(function () use ($user, $workspace, $data) {
            $hub = Hub::create([
                ...$data,
                'workspace_id' => $workspace->id,
                'created_by' => $user->id,
                'slug' => Hub::generateUniqueSlug($data['name']),
            ]);

            // Create owner member
            $hub->members()->create([
                'user_id' => $user->id,
                'role' => HubMember::ROLE_OWNER,
                'joined_at' => now(),
                'is_active' => true,
            ]);

            return $hub;
        });
    }

    public function updateHub(Hub $hub, array $data): Hub
    {
        if (isset($data['name']) && $data['name'] !== $hub->name) {
            $data['slug'] = Hub::generateUniqueSlug($data['name']);
        }

        $hub->update($data);

        return $hub;
    }

    public function addMember(Hub $hub, User $user, string $role = HubMember::ROLE_MEMBER): HubMember
    {
        return $hub->members()->create([
            'user_id' => $user->id,
            'role' => $role,
            'joined_at' => now(),
            'is_active' => true,
        ]);
    }

    public function removeMember(Hub $hub, User $user): bool
    {
        return $hub->members()
            ->where('user_id', $user->id)
            ->update(['is_active' => false]);
    }

    public function updateMemberRole(Hub $hub, User $user, string $role): bool
    {
        return $hub->members()
            ->where('user_id', $user->id)
            ->update(['role' => $role]);
    }

    public function publishHub(Hub $hub): Hub
    {
        $hub->update([
            'published_at' => now(),
            'is_active' => true,
        ]);

        return $hub;
    }
}


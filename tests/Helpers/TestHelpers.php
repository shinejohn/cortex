<?php

namespace Tests\Helpers;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Hash;

class TestHelpers
{
    /**
     * Create a test user
     */
    public static function createUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ], $attributes));
    }

    /**
     * Create a test user with workspace
     */
    public static function createUserWithWorkspace(array $userAttributes = [], array $workspaceAttributes = []): array
    {
        $user = self::createUser($userAttributes);
        $workspace = Workspace::factory()->create(array_merge([
            'owner_id' => $user->id,
        ], $workspaceAttributes));

        $user->update(['current_workspace_id' => $workspace->id]);

        return ['user' => $user, 'workspace' => $workspace];
    }

    /**
     * Act as authenticated user
     */
    public static function actingAsUser($test, ?User $user = null): User
    {
        $user = $user ?? self::createUser();
        $test->actingAs($user);
        return $user;
    }
}


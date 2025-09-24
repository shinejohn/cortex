<?php

declare(strict_types=1);

use App\Models\SocialGroup;
use App\Models\SocialGroupMember;
use App\Models\SocialGroupPost;
use App\Models\User;

it('allows user to create group', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withoutMiddleware()
        ->post('/social/groups', [
            'name' => 'Test Group',
            'description' => 'This is a test group',
            'privacy' => 'public',
        ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('social_groups', [
        'name' => 'Test Group',
        'creator_id' => $user->id,
        'privacy' => 'public',
    ]);

    $this->assertDatabaseHas('social_group_members', [
        'user_id' => $user->id,
        'role' => 'admin',
        'status' => 'approved',
    ]);
});

it('allows user to join public group', function () {
    $creator = User::factory()->create();
    $user = User::factory()->create();

    $group = SocialGroup::create([
        'name' => 'Test Group',
        'description' => 'This is a test group',
        'privacy' => 'public',
        'creator_id' => $creator->id,
        'is_active' => true,
    ]);

    SocialGroupMember::create([
        'group_id' => $group->id,
        'user_id' => $creator->id,
        'role' => 'admin',
        'status' => 'approved',
    ]);

    $response = $this->actingAs($user)->withoutMiddleware()->post("/social/groups/{$group->id}/join");

    $response->assertSuccessful();

    $this->assertDatabaseHas('social_group_members', [
        'group_id' => $group->id,
        'user_id' => $user->id,
        'status' => 'approved',
    ]);
});

it('allows user to leave group', function () {
    $user = User::factory()->create();

    $group = SocialGroup::create([
        'name' => 'Test Group',
        'description' => 'This is a test group',
        'privacy' => 'public',
        'creator_id' => $user->id,
        'is_active' => true,
    ]);

    SocialGroupMember::create([
        'group_id' => $group->id,
        'user_id' => $user->id,
        'role' => 'member',
        'status' => 'approved',
    ]);

    $otherUser = User::factory()->create();
    SocialGroupMember::create([
        'group_id' => $group->id,
        'user_id' => $otherUser->id,
        'role' => 'admin',
        'status' => 'approved',
    ]);

    $response = $this->actingAs($user)->withoutMiddleware()->delete("/social/groups/{$group->id}/leave");

    $response->assertSuccessful();

    $this->assertDatabaseMissing('social_group_members', [
        'group_id' => $group->id,
        'user_id' => $user->id,
    ]);
});

it('allows member to create post in group', function () {
    $user = User::factory()->create();

    $group = SocialGroup::create([
        'name' => 'Test Group',
        'description' => 'This is a test group',
        'privacy' => 'public',
        'creator_id' => $user->id,
        'is_active' => true,
    ]);

    SocialGroupMember::create([
        'group_id' => $group->id,
        'user_id' => $user->id,
        'role' => 'admin',
        'status' => 'approved',
    ]);

    $response = $this->actingAs($user)->withoutMiddleware()->post("/social/groups/{$group->id}/posts", [
        'content' => 'This is a test post',
    ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('social_group_posts', [
        'group_id' => $group->id,
        'user_id' => $user->id,
        'content' => 'This is a test post',
        'is_active' => true,
    ]);
});

it('prevents non-member from creating post in group', function () {
    $creator = User::factory()->create();
    $user = User::factory()->create();

    $group = SocialGroup::create([
        'name' => 'Test Group',
        'description' => 'This is a test group',
        'privacy' => 'public',
        'creator_id' => $creator->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->withoutMiddleware()->post("/social/groups/{$group->id}/posts", [
        'content' => 'This is a test post',
    ]);

    $response->assertForbidden();
});

it('allows group admin to pin post', function () {
    $admin = User::factory()->create();
    $member = User::factory()->create();

    $group = SocialGroup::create([
        'name' => 'Test Group',
        'description' => 'This is a test group',
        'privacy' => 'public',
        'creator_id' => $admin->id,
        'is_active' => true,
    ]);

    SocialGroupMember::create([
        'group_id' => $group->id,
        'user_id' => $admin->id,
        'role' => 'admin',
        'status' => 'approved',
    ]);

    SocialGroupMember::create([
        'group_id' => $group->id,
        'user_id' => $member->id,
        'role' => 'member',
        'status' => 'approved',
    ]);

    $post = SocialGroupPost::create([
        'group_id' => $group->id,
        'user_id' => $member->id,
        'content' => 'This is a test post',
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->withoutMiddleware()->patch("/social/groups/{$group->id}/posts/{$post->id}/pin");

    $response->assertSuccessful();

    $post->refresh();
    expect($post->is_pinned)->toBe(true);
});

it('prevents regular member from pinning post', function () {
    $admin = User::factory()->create();
    $member = User::factory()->create();

    $group = SocialGroup::create([
        'name' => 'Test Group',
        'description' => 'This is a test group',
        'privacy' => 'public',
        'creator_id' => $admin->id,
        'is_active' => true,
    ]);

    SocialGroupMember::create([
        'group_id' => $group->id,
        'user_id' => $admin->id,
        'role' => 'admin',
        'status' => 'approved',
    ]);

    SocialGroupMember::create([
        'group_id' => $group->id,
        'user_id' => $member->id,
        'role' => 'member',
        'status' => 'approved',
    ]);

    $post = SocialGroupPost::create([
        'group_id' => $group->id,
        'user_id' => $member->id,
        'content' => 'This is a test post',
        'is_active' => true,
    ]);

    $response = $this->actingAs($member)->withoutMiddleware()->patch("/social/groups/{$group->id}/posts/{$post->id}/pin");

    $response->assertForbidden();
});

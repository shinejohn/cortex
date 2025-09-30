<?php

declare(strict_types=1);

use App\Models\Event;
use App\Models\Follow;
use App\Models\Performer;
use App\Models\User;
use App\Models\Venue;
use App\Models\Workspace;

test('authenticated user can follow an event', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id, 'created_by' => $user->id]);

    $response = $this->actingAs($user)->postJson('/api/follow/toggle', [
        'followable_type' => 'event',
        'followable_id' => $event->id,
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'following' => true,
            'message' => 'Followed successfully',
        ]);

    $this->assertDatabaseHas('follows', [
        'user_id' => $user->id,
        'followable_type' => Event::class,
        'followable_id' => $event->id,
    ]);
});

test('authenticated user can follow a performer', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $performer = Performer::factory()->create(['workspace_id' => $workspace->id, 'created_by' => $user->id]);

    $response = $this->actingAs($user)->postJson('/api/follow/toggle', [
        'followable_type' => 'performer',
        'followable_id' => $performer->id,
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'following' => true,
        ]);

    $this->assertDatabaseHas('follows', [
        'user_id' => $user->id,
        'followable_type' => Performer::class,
        'followable_id' => $performer->id,
    ]);
});

test('authenticated user can follow a venue', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $venue = Venue::factory()->create(['workspace_id' => $workspace->id, 'created_by' => $user->id]);

    $response = $this->actingAs($user)->postJson('/api/follow/toggle', [
        'followable_type' => 'venue',
        'followable_id' => $venue->id,
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'following' => true,
        ]);

    $this->assertDatabaseHas('follows', [
        'user_id' => $user->id,
        'followable_type' => Venue::class,
        'followable_id' => $venue->id,
    ]);
});

test('authenticated user can unfollow an event', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id, 'created_by' => $user->id]);

    Follow::create([
        'user_id' => $user->id,
        'followable_type' => Event::class,
        'followable_id' => $event->id,
    ]);

    $response = $this->actingAs($user)->postJson('/api/follow/toggle', [
        'followable_type' => 'event',
        'followable_id' => $event->id,
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'following' => false,
            'message' => 'Unfollowed successfully',
        ]);

    $this->assertDatabaseMissing('follows', [
        'user_id' => $user->id,
        'followable_type' => Event::class,
        'followable_id' => $event->id,
    ]);
});

test('user cannot follow the same entity twice', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id, 'created_by' => $user->id]);

    Follow::create([
        'user_id' => $user->id,
        'followable_type' => Event::class,
        'followable_id' => $event->id,
    ]);

    $this->actingAs($user)->postJson('/api/follow/toggle', [
        'followable_type' => 'event',
        'followable_id' => $event->id,
    ]);

    expect(Follow::where('user_id', $user->id)
        ->where('followable_type', Event::class)
        ->where('followable_id', $event->id)
        ->count())->toBe(0);
});

test('authenticated user can check follow status', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id, 'created_by' => $user->id]);

    Follow::create([
        'user_id' => $user->id,
        'followable_type' => Event::class,
        'followable_id' => $event->id,
    ]);

    $response = $this->actingAs($user)->getJson('/api/follow/status?followable_type=event&followable_id='.$event->id);

    $response->assertSuccessful()
        ->assertJson([
            'following' => true,
        ]);
});

test('guest cannot follow an event', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id, 'created_by' => $user->id]);

    $response = $this->postJson('/api/follow/toggle', [
        'followable_type' => 'event',
        'followable_id' => $event->id,
    ]);

    $response->assertUnauthorized();
});

test('follow requires valid followable type', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/follow/toggle', [
        'followable_type' => 'invalid',
        'followable_id' => '123',
    ]);

    $response->assertUnprocessable();
});

test('follow requires valid followable id', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/follow/toggle', [
        'followable_type' => 'event',
        'followable_id' => '999999',
    ]);

    $response->assertNotFound();
});

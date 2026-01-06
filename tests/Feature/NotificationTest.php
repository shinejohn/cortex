<?php

declare(strict_types=1);

use App\Models\Notification;
use App\Models\User;

beforeEach(function () {
    $this->withoutMiddleware();
});

it('can display the notifications index page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/notifications');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('event-city/notifications/index')
        ->has('notifications')
    );
});

it('can fetch unread notifications via API', function () {
    $user = User::factory()->create();

    Notification::factory()->count(3)->create([
        'user_id' => $user->id,
        'read' => false,
    ]);

    Notification::factory()->count(2)->create([
        'user_id' => $user->id,
        'read' => true,
    ]);

    $response = $this->actingAs($user)->get('/api/notifications/unread');

    $response->assertSuccessful();
    $response->assertJson([
        'unread_count' => 3,
    ]);
    $response->assertJsonCount(3, 'notifications');
});

it('can mark a notification as read', function () {
    $user = User::factory()->create();

    $notification = Notification::factory()->create([
        'user_id' => $user->id,
        'read' => false,
    ]);

    $response = $this->actingAs($user)
        ->patch("/api/notifications/{$notification->id}/read");

    $response->assertSuccessful();

    expect($notification->fresh()->read)->toBeTrue();
});

it('cannot mark another users notification as read', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $notification = Notification::factory()->create([
        'user_id' => $otherUser->id,
        'read' => false,
    ]);

    $response = $this->actingAs($user)
        ->patch("/api/notifications/{$notification->id}/read");

    $response->assertForbidden();

    expect($notification->fresh()->read)->toBeFalse();
});

it('can mark all notifications as read', function () {
    $user = User::factory()->create();

    Notification::factory()->count(3)->create([
        'user_id' => $user->id,
        'read' => false,
    ]);

    $response = $this->actingAs($user)
        ->patch('/api/notifications/mark-all-read');

    $response->assertSuccessful();

    expect(Notification::where('user_id', $user->id)->where('read', false)->count())
        ->toBe(0);
});

it('only shows notifications for the authenticated user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Notification::factory()->count(2)->create([
        'user_id' => $user->id,
        'read' => false,
    ]);

    Notification::factory()->count(3)->create([
        'user_id' => $otherUser->id,
        'read' => false,
    ]);

    $response = $this->actingAs($user)->get('/api/notifications/unread');

    $response->assertSuccessful();
    $response->assertJsonCount(2, 'notifications');
});

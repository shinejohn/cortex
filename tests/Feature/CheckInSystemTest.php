<?php

declare(strict_types=1);

use App\Models\CheckIn;
use App\Models\PlannedEvent;
use App\Models\Event;
use App\Models\User;
use App\Models\Workspace;
use App\Models\TicketOrder;
use App\Models\TicketOrderItem;

test('authenticated user can check in to event', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);

    $this->actingAs($user);

    $response = $this->postJson("/api/events/{$event->id}/check-in", [
        'location' => 'Main Entrance',
        'is_public' => true,
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'message',
        'check_in' => ['id', 'event_id', 'user_id', 'checked_in_at'],
    ]);
    
    $this->assertDatabaseHas('check_ins', [
        'event_id' => $event->id,
        'user_id' => $user->id,
    ]);
});

test('user cannot check in twice to same event', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);

    CheckIn::create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'checked_in_at' => now(),
        'is_public' => true,
    ]);

    $this->actingAs($user);

    $response = $this->postJson("/api/events/{$event->id}/check-in", [
        'location' => 'Main Entrance',
    ]);

    $response->assertStatus(409);
    $response->assertJson([
        'message' => 'You have already checked in to this event.',
    ]);
});

test('can view event check-ins', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);

    CheckIn::factory()->count(5)->create([
        'event_id' => $event->id,
        'is_public' => true,
    ]);

    $response = $this->getJson("/api/events/{$event->id}/check-ins");
    $response->assertStatus(200);
    $response->assertJsonCount(5);
});

test('authenticated user can plan event', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);

    $this->actingAs($user);

    $response = $this->postJson("/api/events/{$event->id}/plan");
    $response->assertStatus(200);
    
    $this->assertDatabaseHas('planned_events', [
        'event_id' => $event->id,
        'user_id' => $user->id,
    ]);
});

test('authenticated user can unplan event', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);

    PlannedEvent::create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'planned_at' => now(),
    ]);

    $this->actingAs($user);

    $response = $this->deleteJson("/api/events/{$event->id}/unplan");
    $response->assertStatus(200);
    $response->assertJson(['success' => true]);
    
    $this->assertDatabaseMissing('planned_events', [
        'event_id' => $event->id,
        'user_id' => $user->id,
    ]);
});

test('can view check-ins index page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    CheckIn::factory()->count(10)->create();

    $response = $this->get('/check-ins');
    $response->assertStatus(200);
});

test('check-in increments event attendance', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
        'member_attendance' => 0,
    ]);

    $this->actingAs($user);

    $this->postJson("/api/events/{$event->id}/check-in", [
        'is_public' => true,
    ]);

    $event->refresh();
    expect($event->member_attendance)->toBe(1);
});

test('check-in can be associated with ticket order item', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);

    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'completed',
    ]);

    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
    ]);

    $this->actingAs($user);

    $response = $this->postJson("/api/events/{$event->id}/check-in", [
        'ticket_order_item_id' => $orderItem->id,
        'is_public' => true,
    ]);

    $response->assertStatus(201);
    
    $this->assertDatabaseHas('check_ins', [
        'event_id' => $event->id,
        'user_id' => $user->id,
        'ticket_order_item_id' => $orderItem->id,
    ]);
});

test('check-in owner can delete check-in', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);

    $checkIn = CheckIn::create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'checked_in_at' => now(),
        'is_public' => true,
    ]);

    $this->actingAs($user);

    $response = $this->delete("/check-ins/{$checkIn->id}");
    $response->assertRedirect();
    
    $this->assertDatabaseMissing('check_ins', [
        'id' => $checkIn->id,
    ]);
});

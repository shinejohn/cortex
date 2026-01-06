<?php

use App\Models\TicketOrder;
use App\Models\User;
use App\Models\Event;
use App\Models\Workspace;
use App\Models\TicketOrderItem;
use App\Models\TicketPlan;

test('can create ticket order', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    $order = TicketOrder::factory()->create([
        'user_id' => $user->id,
        'event_id' => $event->id,
    ]);
    
    expect($order)->toBeInstanceOf(TicketOrder::class);
    expect($order->id)->toBeString();
});

test('ticket order has required attributes', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    $order = TicketOrder::factory()->create([
        'user_id' => $user->id,
        'event_id' => $event->id,
        'order_number' => 'TO-123456',
        'total_amount' => 100.00,
    ]);
    
    expect($order->order_number)->toBe('TO-123456');
    expect($order->total_amount)->toBe(100.00);
});

test('ticket order belongs to user', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    $order = TicketOrder::factory()->create([
        'user_id' => $user->id,
        'event_id' => $event->id,
    ]);
    
    expect($order->user)->toBeInstanceOf(User::class);
    expect($order->user->id)->toBe($user->id);
});

test('ticket order belongs to event', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    $order = TicketOrder::factory()->create([
        'user_id' => $user->id,
        'event_id' => $event->id,
    ]);
    
    expect($order->event)->toBeInstanceOf(Event::class);
    expect($order->event->id)->toBe($event->id);
});

test('ticket order has items', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    $ticketPlan = TicketPlan::factory()->create(['event_id' => $event->id]);
    
    $order = TicketOrder::factory()->create([
        'user_id' => $user->id,
        'event_id' => $event->id,
    ]);
    
    TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
        'ticket_plan_id' => $ticketPlan->id,
    ]);
    
    expect($order->items)->toHaveCount(1);
});

test('ticket order number is unique', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    TicketOrder::factory()->create(['order_number' => 'TO-123456']);
    
    expect(function () use ($user, $event) {
        TicketOrder::factory()->create(['order_number' => 'TO-123456']);
    })->toThrow(Illuminate\Database\QueryException::class);
});

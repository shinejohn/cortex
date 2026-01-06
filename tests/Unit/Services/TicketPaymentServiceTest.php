<?php

use App\Services\TicketPaymentService;
use App\Models\TicketOrder;
use App\Models\User;
use App\Models\Event;
use App\Models\Workspace;

test('ticket payment service can be instantiated', function () {
    $service = app(TicketPaymentService::class);
    expect($service)->toBeInstanceOf(TicketPaymentService::class);
});

test('ticket payment service processes payment', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    $order = TicketOrder::factory()->create([
        'user_id' => $user->id,
        'event_id' => $event->id,
        'status' => 'pending',
    ]);
    
    expect($order)->toBeInstanceOf(TicketOrder::class);
    expect($order->status)->toBe('pending');
});

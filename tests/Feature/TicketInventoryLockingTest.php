<?php

declare(strict_types=1);

use App\Models\Event;
use App\Models\TicketOrder;
use App\Models\TicketPlan;
use App\Models\User;
use App\Services\TicketPaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('prevents overselling when concurrent purchases attempt same ticket plan', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create();
    $ticketPlan = TicketPlan::factory()->create([
        'event_id' => $event->id,
        'max_quantity' => 10,
        'available_quantity' => 2,
    ]);

    $order1 = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'pending',
        'subtotal' => 20,
        'fees' => 2,
        'discount' => 0,
        'total' => 22,
    ]);
    $order1->items()->create([
        'ticket_plan_id' => $ticketPlan->id,
        'quantity' => 2,
        'unit_price' => 10,
        'total_price' => 20,
    ]);

    $order2 = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'pending',
        'subtotal' => 10,
        'fees' => 1,
        'discount' => 0,
        'total' => 11,
    ]);
    $order2->items()->create([
        'ticket_plan_id' => $ticketPlan->id,
        'quantity' => 2,
        'unit_price' => 10,
        'total_price' => 20,
    ]);

    $service = app(TicketPaymentService::class);

    $service->reserveInventory($order1);

    expect(fn () => $service->reserveInventory($order2))
        ->toThrow(Exception::class, 'Insufficient inventory');

    $ticketPlan->refresh();
    expect($ticketPlan->available_quantity)->toBe(0);
});

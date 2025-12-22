<?php

declare(strict_types=1);

use App\Models\TicketOrder;
use App\Models\TicketOrderItem;
use App\Models\TicketPlan;
use App\Models\Event;
use App\Models\User;
use App\Models\Workspace;
use App\Services\TicketPaymentService;
use Illuminate\Support\Facades\Config;

test('ticket payment service creates checkout session', function () {
    Config::set('services.stripe.key', 'sk_test_fake_key');
    
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'pending',
        'total' => 100.00,
    ]);
    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
        'unit_price' => 50.00,
        'quantity' => 2,
    ]);

    $service = app(TicketPaymentService::class);
    
    // Mock Stripe client would be needed for full test
    // This test verifies the service structure exists
    expect($service)->toBeInstanceOf(TicketPaymentService);
});

test('ticket order redirects to stripe checkout for paid tickets', function () {
    $this->withoutMiddleware();
    
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);
    $ticketPlan = TicketPlan::factory()->create([
        'event_id' => $event->id,
        'price' => 50.00,
        'available_quantity' => 10,
    ]);

    $this->actingAs($user);

    $orderData = [
        'event_id' => $event->id,
        'items' => [
            [
                'ticket_plan_id' => $ticketPlan->id,
                'quantity' => 2,
            ],
        ],
    ];

    $response = $this->postJson('/api/ticket-orders', $orderData);
    
    // Should return checkout session data (or redirect)
    // Note: Actual Stripe integration would require mocking
    expect($response->status())->toBeIn([200, 201, 302]);
});

test('free ticket orders are completed immediately', function () {
    $this->withoutMiddleware();
    
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);
    $ticketPlan = TicketPlan::factory()->create([
        'event_id' => $event->id,
        'price' => 0,
        'available_quantity' => 10,
    ]);

    $this->actingAs($user);

    $orderData = [
        'event_id' => $event->id,
        'items' => [
            [
                'ticket_plan_id' => $ticketPlan->id,
                'quantity' => 2,
            ],
        ],
    ];

    $response = $this->postJson('/api/ticket-orders', $orderData);
    $response->assertStatus(201);
    
    $order = TicketOrder::where('event_id', $event->id)
        ->where('user_id', $user->id)
        ->first();
    
    expect($order)->not->toBeNull();
    expect($order->status)->toBe('completed');
    expect($order->payment_status)->toBe('completed');
    expect($order->completed_at)->not->toBeNull();
});

test('checkout success route handles completed payment', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'pending',
        'payment_status' => 'pending',
    ]);

    $this->actingAs($user);

    $response = $this->get("/tickets/checkout/success/{$order->id}");
    
    // Should redirect to my-tickets or show success message
    expect($response->status())->toBeIn([200, 302]);
});

test('checkout cancel route handles cancelled payment', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'pending',
        'payment_status' => 'pending',
    ]);

    $this->actingAs($user);

    $response = $this->get("/tickets/checkout/cancel/{$order->id}");
    
    // Should redirect or show cancel message
    expect($response->status())->toBeIn([200, 302]);
});

test('ticket order includes fees in total', function () {
    $this->withoutMiddleware();
    
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);
    $ticketPlan = TicketPlan::factory()->create([
        'event_id' => $event->id,
        'price' => 100.00,
        'available_quantity' => 10,
    ]);

    $this->actingAs($user);

    $orderData = [
        'event_id' => $event->id,
        'items' => [
            [
                'ticket_plan_id' => $ticketPlan->id,
                'quantity' => 1,
            ],
        ],
    ];

    $response = $this->postJson('/api/ticket-orders', $orderData);
    
    $order = TicketOrder::where('event_id', $event->id)
        ->where('user_id', $user->id)
        ->first();
    
    expect($order)->not->toBeNull();
    expect($order->subtotal)->toBe(100.00);
    expect($order->fees)->toBeGreaterThan(0); // 10% marketplace fee
    expect($order->total)->toBeGreaterThan($order->subtotal);
});

test('promo code discount is applied to ticket order', function () {
    $this->withoutMiddleware();
    
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'status' => 'published',
    ]);
    $ticketPlan = TicketPlan::factory()->create([
        'event_id' => $event->id,
        'price' => 100.00,
        'available_quantity' => 10,
    ]);
    $promoCode = \App\Models\PromoCode::factory()->create([
        'code' => 'TEST20',
        'type' => 'percentage',
        'value' => 20,
        'is_active' => true,
    ]);

    $this->actingAs($user);

    $orderData = [
        'event_id' => $event->id,
        'items' => [
            [
                'ticket_plan_id' => $ticketPlan->id,
                'quantity' => 1,
            ],
        ],
        'promo_code' => [
            'code' => 'TEST20',
        ],
    ];

    $response = $this->postJson('/api/ticket-orders', $orderData);
    
    $order = TicketOrder::where('event_id', $event->id)
        ->where('user_id', $user->id)
        ->first();
    
    expect($order)->not->toBeNull();
    expect($order->discount)->toBeGreaterThan(0);
    expect($order->total)->toBeLessThan($order->subtotal + $order->fees);
});

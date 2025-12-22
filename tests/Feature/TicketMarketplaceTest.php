<?php

declare(strict_types=1);

use App\Models\TicketListing;
use App\Models\TicketTransfer;
use App\Models\TicketGift;
use App\Models\TicketOrder;
use App\Models\TicketOrderItem;
use App\Models\TicketPlan;
use App\Models\Event;
use App\Models\User;
use App\Models\Workspace;

test('can view ticket marketplace page', function () {
    TicketListing::factory()->count(5)->create([
        'status' => 'available',
    ]);

    $response = $this->get('/tickets/marketplace');
    $response->assertStatus(200);
});

test('authenticated user can list ticket for sale', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
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

    $listingData = [
        'original_ticket_order_item_id' => $orderItem->id,
        'event_id' => $event->id,
        'price' => 50.00,
        'quantity' => 1,
    ];

    $response = $this->post('/tickets/list-for-sale', $listingData);
    $response->assertRedirect();
    
    $this->assertDatabaseHas('ticket_listings', [
        'original_ticket_order_item_id' => $orderItem->id,
        'seller_user_id' => $user->id,
        'event_id' => $event->id,
        'price' => 50.00,
        'status' => 'available',
    ]);
});

test('can view ticket listing detail', function () {
    $listing = TicketListing::factory()->create([
        'status' => 'available',
    ]);

    $response = $this->get("/tickets/marketplace/{$listing->id}");
    $response->assertStatus(200);
});

test('authenticated user can purchase ticket listing', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $seller->id,
        'status' => 'completed',
    ]);
    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
    ]);
    $listing = TicketListing::factory()->create([
        'original_ticket_order_item_id' => $orderItem->id,
        'seller_user_id' => $seller->id,
        'event_id' => $event->id,
        'status' => 'available',
    ]);

    $this->actingAs($buyer);

    $response = $this->post("/tickets/marketplace/{$listing->id}/purchase");
    $response->assertRedirect();
    
    $listing->refresh();
    expect($listing->status)->toBe('sold');
    expect($listing->sold_at)->not->toBeNull();
});

test('authenticated user can transfer ticket', function () {
    $sender = User::factory()->create();
    $receiver = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $sender->id,
        'status' => 'completed',
    ]);
    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
    ]);

    $this->actingAs($sender);

    $transferData = [
        'receiver_user_id' => $receiver->id,
        'message' => 'Transfer message',
    ];

    $response = $this->post("/tickets/transfer/{$orderItem->id}", $transferData);
    $response->assertRedirect();
    
    $this->assertDatabaseHas('ticket_transfers', [
        'ticket_order_item_id' => $orderItem->id,
        'sender_user_id' => $sender->id,
        'receiver_user_id' => $receiver->id,
        'status' => 'pending',
    ]);
});

test('receiver can accept ticket transfer', function () {
    $sender = User::factory()->create();
    $receiver = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $sender->id,
        'status' => 'completed',
    ]);
    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
    ]);
    $transfer = TicketTransfer::factory()->create([
        'ticket_order_item_id' => $orderItem->id,
        'sender_user_id' => $sender->id,
        'receiver_user_id' => $receiver->id,
        'status' => 'pending',
    ]);

    $this->actingAs($receiver);

    $response = $this->post("/tickets/transfer/{$transfer->id}/complete");
    $response->assertRedirect();
    
    $transfer->refresh();
    expect($transfer->status)->toBe('accepted');
});

test('authenticated user can gift ticket', function () {
    $sender = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $sender->id,
        'status' => 'completed',
    ]);
    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
    ]);

    $this->actingAs($sender);

    $giftData = [
        'receiver_email' => 'recipient@example.com',
        'message' => 'Gift message',
    ];

    $response = $this->post("/tickets/gift/{$orderItem->id}", $giftData);
    $response->assertRedirect();
    
    $this->assertDatabaseHas('ticket_gifts', [
        'ticket_order_item_id' => $orderItem->id,
        'sender_user_id' => $sender->id,
        'receiver_email' => 'recipient@example.com',
        'status' => 'pending',
    ]);
});

test('gift recipient can redeem ticket', function () {
    $sender = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $sender->id,
        'status' => 'completed',
    ]);
    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
    ]);
    $gift = TicketGift::factory()->create([
        'ticket_order_item_id' => $orderItem->id,
        'sender_user_id' => $sender->id,
        'receiver_email' => 'recipient@example.com',
        'status' => 'pending',
    ]);

    $token = $gift->id; // Assuming token is gift ID for simplicity

    $response = $this->get("/tickets/gift/redeem/{$token}");
    $response->assertStatus(200);
});

test('sender can cancel ticket transfer', function () {
    $sender = User::factory()->create();
    $receiver = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $sender->id,
        'status' => 'completed',
    ]);
    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
    ]);
    $transfer = TicketTransfer::factory()->create([
        'ticket_order_item_id' => $orderItem->id,
        'sender_user_id' => $sender->id,
        'receiver_user_id' => $receiver->id,
        'status' => 'pending',
    ]);

    $this->actingAs($sender);

    $response = $this->post("/tickets/transfer/{$transfer->id}/cancel");
    $response->assertRedirect();
    
    $transfer->refresh();
    expect($transfer->status)->toBe('cancelled');
});

test('sender can cancel ticket gift', function () {
    $sender = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $sender->id,
        'status' => 'completed',
    ]);
    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
    ]);
    $gift = TicketGift::factory()->create([
        'ticket_order_item_id' => $orderItem->id,
        'sender_user_id' => $sender->id,
        'status' => 'pending',
    ]);

    $this->actingAs($sender);

    $response = $this->post("/tickets/gift/{$gift->id}/cancel");
    $response->assertRedirect();
    
    $gift->refresh();
    expect($gift->status)->toBe('cancelled');
});

test('only listing owner can delete listing', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $owner->id,
        'status' => 'completed',
    ]);
    $orderItem = TicketOrderItem::factory()->create([
        'ticket_order_id' => $order->id,
    ]);
    $listing = TicketListing::factory()->create([
        'original_ticket_order_item_id' => $orderItem->id,
        'seller_user_id' => $owner->id,
        'event_id' => $event->id,
    ]);

    $this->actingAs($otherUser);

    $response = $this->delete("/tickets/marketplace/{$listing->id}");
    $response->assertForbidden();
});

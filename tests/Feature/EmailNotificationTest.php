<?php

declare(strict_types=1);

use App\Models\TicketOrder;
use App\Models\TicketOrderItem;
use App\Models\TicketPlan;
use App\Models\Event;
use App\Models\CheckIn;
use App\Models\Booking;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\TicketOrderConfirmationNotification;
use App\Notifications\CheckInConfirmationNotification;
use App\Notifications\BookingConfirmationNotification;
use Illuminate\Support\Facades\Notification;

test('ticket order confirmation notification is sent on order completion', function () {
    Notification::fake();
    
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'completed',
        'payment_status' => 'completed',
    ]);

    $user->notify(new TicketOrderConfirmationNotification($order));

    Notification::assertSentTo($user, TicketOrderConfirmationNotification::class);
});

test('check-in confirmation notification is sent on check-in', function () {
    Notification::fake();
    
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $checkIn = CheckIn::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'checked_in_at' => now(),
    ]);

    $user->notify(new CheckInConfirmationNotification($checkIn));

    Notification::assertSentTo($user, CheckInConfirmationNotification::class);
});

test('booking confirmation notification is sent on booking creation', function () {
    Notification::fake();
    
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $booking = Booking::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
        'contact_email' => $user->email,
        'status' => 'confirmed',
    ]);

    $user->notify(new BookingConfirmationNotification($booking));

    Notification::assertSentTo($user, BookingConfirmationNotification::class);
});

test('ticket order notification includes order details', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'title' => 'Test Event',
    ]);
    $order = TicketOrder::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'completed',
        'total' => 100.00,
    ]);

    $notification = new TicketOrderConfirmationNotification($order);
    $mailMessage = $notification->toMail($user);

    expect($mailMessage)->not->toBeNull();
    expect($mailMessage->subject)->toContain($event->title);
});

test('check-in notification includes event details', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'title' => 'Test Event',
    ]);
    $checkIn = CheckIn::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'checked_in_at' => now(),
    ]);

    $notification = new CheckInConfirmationNotification($checkIn);
    $mailMessage = $notification->toMail($user);

    expect($mailMessage)->not->toBeNull();
    expect($mailMessage->subject)->toContain($event->title);
});

test('booking notification includes booking details', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $booking = Booking::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
        'contact_email' => $user->email,
        'booking_number' => 'BK-TEST123',
        'status' => 'confirmed',
    ]);

    $notification = new BookingConfirmationNotification($booking);
    $mailMessage = $notification->toMail($user);

    expect($mailMessage)->not->toBeNull();
    expect($mailMessage->subject)->toContain($booking->booking_number);
});

test('notifications are queued', function () {
    $ticketNotification = new TicketOrderConfirmationNotification(
        TicketOrder::factory()->make()
    );
    $checkInNotification = new CheckInConfirmationNotification(
        CheckIn::factory()->make()
    );
    $bookingNotification = new BookingConfirmationNotification(
        Booking::factory()->make()
    );

    expect($ticketNotification)->toBeInstanceOf(\Illuminate\Contracts\Queue\ShouldQueue::class);
    expect($checkInNotification)->toBeInstanceOf(\Illuminate\Contracts\Queue\ShouldQueue::class);
    expect($bookingNotification)->toBeInstanceOf(\Illuminate\Contracts\Queue\ShouldQueue::class);
});

test('ticket order notification can be converted to array', function () {
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

    $notification = new TicketOrderConfirmationNotification($order);
    $array = $notification->toArray($user);

    expect($array)->toBeArray();
    expect($array)->toHaveKey('ticket_order_id');
    expect($array)->toHaveKey('event_title');
    expect($array)->toHaveKey('total');
});

test('check-in notification can be converted to array', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
    ]);
    $checkIn = CheckIn::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'checked_in_at' => now(),
    ]);

    $notification = new CheckInConfirmationNotification($checkIn);
    $array = $notification->toArray($user);

    expect($array)->toBeArray();
    expect($array)->toHaveKey('check_in_id');
    expect($array)->toHaveKey('event_title');
    expect($array)->toHaveKey('checked_in_at');
});

test('booking notification can be converted to array', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $booking = Booking::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
        'contact_email' => $user->email,
    ]);

    $notification = new BookingConfirmationNotification($booking);
    $array = $notification->toArray($user);

    expect($array)->toBeArray();
    expect($array)->toHaveKey('booking_id');
    expect($array)->toHaveKey('booking_number');
    expect($array)->toHaveKey('status');
    expect($array)->toHaveKey('total_amount');
});

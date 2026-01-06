<?php

declare(strict_types=1);

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\SocialFriendship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;

uses(RefreshDatabase::class, WithoutMiddleware::class);

beforeEach(function () {
    $this->user1 = User::factory()->create();
    $this->user2 = User::factory()->create();

    // Create friendship between users
    SocialFriendship::factory()->create([
        'user_id' => $this->user1->id,
        'friend_id' => $this->user2->id,
        'status' => 'accepted',
    ]);
});

test('user can view messages index page', function () {
    $response = $this->actingAs($this->user1)
        ->get(route('social.messages.index'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('event-city/social/messages-index')
        ->has('conversations')
        ->has('current_user')
    );
});

test('user can start new conversation with friend', function () {
    $response = $this->actingAs($this->user1)
        ->post(route('social.messages.start'), [
            'user_id' => $this->user2->id,
            'message' => 'Hello, how are you?',
        ]);

    $response->assertSuccessful();
    $response->assertJson(['success' => true]);

    expect(Conversation::count())->toBe(1);
    expect(Message::count())->toBe(1);

    $conversation = Conversation::first();
    expect($conversation->type)->toBe('private');
    expect($conversation->participants->count())->toBe(2);

    $message = Message::first();
    expect($message->content)->toBe('Hello, how are you?');
    expect($message->sender_id)->toBe($this->user1->id);
});

test('user cannot start conversation with non-friend', function () {
    $stranger = User::factory()->create();

    $response = $this->actingAs($this->user1)
        ->post(route('social.messages.start'), [
            'user_id' => $stranger->id,
            'message' => 'Hello stranger',
        ]);

    $response->assertForbidden();
    expect(Conversation::count())->toBe(0);
});

test('user can send message in existing conversation', function () {
    $conversation = Conversation::factory()->private()->create();

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user1->id,
        'joined_at' => now(),
    ]);

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user2->id,
        'joined_at' => now(),
    ]);

    $response = $this->actingAs($this->user1)
        ->post(route('social.messages.send', $conversation->id), [
            'message' => 'This is a test message',
        ]);

    $response->assertSuccessful();
    $response->assertJson(['success' => true]);

    expect(Message::count())->toBe(1);

    $message = Message::first();
    expect($message->content)->toBe('This is a test message');
    expect($message->sender_id)->toBe($this->user1->id);
    expect($message->conversation_id)->toBe($conversation->id);
});

test('user cannot send message to conversation they are not part of', function () {
    $conversation = Conversation::factory()->private()->create();
    $otherUser = User::factory()->create();

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user2->id,
        'joined_at' => now(),
    ]);

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $otherUser->id,
        'joined_at' => now(),
    ]);

    $response = $this->actingAs($this->user1)
        ->post(route('social.messages.send', $conversation->id), [
            'message' => 'This should fail',
        ]);

    $response->assertNotFound();
    expect(Message::count())->toBe(0);
});

test('user can view conversation with messages', function () {
    $conversation = Conversation::factory()->private()->create();

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user1->id,
        'joined_at' => now(),
    ]);

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user2->id,
        'joined_at' => now(),
    ]);

    Message::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $this->user1->id,
        'content' => 'Hello there!',
    ]);

    Message::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $this->user2->id,
        'content' => 'Hi back!',
    ]);

    $response = $this->actingAs($this->user1)
        ->get(route('social.messages.show', $conversation->id));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('event-city/social/messages-index')
        ->where('selected_conversation', $conversation->id)
        ->has('messages', 2)
        ->has('conversations')
    );
});

test('conversation marks as read when viewed', function () {
    $conversation = Conversation::factory()->private()->create();

    $participant = ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user1->id,
        'joined_at' => now(),
        'last_read_at' => null,
    ]);

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user2->id,
        'joined_at' => now(),
    ]);

    expect($participant->last_read_at)->toBeNull();

    $this->actingAs($this->user1)
        ->get(route('social.messages.show', $conversation->id));

    $participant->refresh();
    expect($participant->last_read_at)->not->toBeNull();
});

test('unread count is calculated correctly', function () {
    $conversation = Conversation::factory()->private()->create();

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user1->id,
        'joined_at' => now(),
        'last_read_at' => now()->subMinutes(10),
    ]);

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user2->id,
        'joined_at' => now(),
    ]);

    // Create messages after user1's last read time
    Message::factory()->count(3)->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $this->user2->id,
        'created_at' => now()->subMinutes(5),
    ]);

    // Create message from user1 (should not count towards unread)
    Message::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $this->user1->id,
        'created_at' => now()->subMinutes(3),
    ]);

    $unreadCount = $conversation->getUnreadCountForUser($this->user1->id);
    expect($unreadCount)->toBe(3);
});

test('message validation works correctly', function () {
    $conversation = Conversation::factory()->private()->create();

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user1->id,
        'joined_at' => now(),
    ]);

    ConversationParticipant::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user2->id,
        'joined_at' => now(),
    ]);

    // Test empty message
    $response = $this->actingAs($this->user1)
        ->postJson(route('social.messages.send', $conversation->id), [
            'message' => '',
        ]);

    $response->assertUnprocessable();

    // Test message too long
    $response = $this->actingAs($this->user1)
        ->postJson(route('social.messages.send', $conversation->id), [
            'message' => str_repeat('a', 1001),
        ]);

    $response->assertUnprocessable();
});

test('new message page shows available friends', function () {
    $response = $this->actingAs($this->user1)
        ->get(route('social.messages.new'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('event-city/social/messages-new')
        ->has('friends')
    );
});

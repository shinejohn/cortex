<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\SendMessageRequest;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class SocialMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Get user's conversations with eager loading
        $conversations = $user->conversations()
            ->with([
                'participants' => function ($query) use ($user) {
                    $query->where('user_id', '!=', $user->id);
                },
                'latestMessage.sender',
            ])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherParticipants = $conversation->participants
                    ->where('id', '!=', $user->id)
                    ->map(function ($participant) {
                        return [
                            'id' => $participant->id,
                            'name' => $participant->name,
                            'avatar' => $participant->avatar,
                            'online' => false, // TODO: implement online status tracking
                        ];
                    });

                $lastMessage = $conversation->latestMessage;

                return [
                    'id' => $conversation->id,
                    'type' => $conversation->type,
                    'title' => $conversation->title,
                    'participants' => $otherParticipants->values(),
                    'last_message' => $lastMessage ? [
                        'text' => $lastMessage->content,
                        'timestamp' => $lastMessage->created_at->toISOString(),
                        'sender' => $lastMessage->sender_id,
                        'sender_name' => $lastMessage->sender->name,
                    ] : null,
                    'unread' => $conversation->getUnreadCountForUser($user->id),
                ];
            });

        $selectedConversationId = $request->route('conversation');
        $messages = [];

        if ($selectedConversationId) {
            $selectedConversation = $user->conversations()
                ->where('conversations.id', $selectedConversationId)
                ->first();

            if ($selectedConversation) {
                // Mark conversation as read
                $selectedConversation->markAsReadForUser($user->id);

                // Get messages for the conversation
                $messages = $selectedConversation->messages()
                    ->with('sender')
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function ($message) {
                        return [
                            'id' => $message->id,
                            'text' => $message->content,
                            'timestamp' => $message->created_at->toISOString(),
                            'sender' => $message->sender_id,
                            'sender_name' => $message->sender->name,
                            'type' => $message->type,
                            'metadata' => $message->metadata,
                            'edited_at' => $message->edited_at?->toISOString(),
                        ];
                    });
            }
        }

        return Inertia::render('event-city/social/messages-index', [
            'conversations' => $conversations,
            'selected_conversation' => $selectedConversationId,
            'messages' => $messages,
            'current_user' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    public function show(string $conversationId): Response
    {
        return $this->index(request()->merge(['conversation' => $conversationId]));
    }

    public function sendMessage(SendMessageRequest $request, string $conversationId): JsonResponse
    {
        $user = Auth::user();

        // Verify user is participant in conversation
        $conversation = $user->conversations()
            ->where('conversations.id', $conversationId)
            ->first();

        if (! $conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found or access denied',
            ], 404);
        }

        // Create the message
        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'content' => $request->input('message'),
            'type' => $request->input('type', 'text'),
            'metadata' => $request->input('metadata'),
        ]);

        // Update conversation's last message timestamp
        $conversation->update([
            'last_message_at' => now(),
        ]);

        // Load sender for response
        $message->load('sender');

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'text' => $message->content,
                'timestamp' => $message->created_at->toISOString(),
                'sender' => $message->sender_id,
                'sender_name' => $message->sender->name,
                'type' => $message->type,
                'metadata' => $message->metadata,
            ],
        ]);
    }

    public function newMessage(): Response
    {
        $user = Auth::user();

        // Get friends to start new conversations with (those who don't have existing conversations)
        $existingConversationUserIds = $user->conversations()
            ->where('type', 'private')
            ->with('participants')
            ->get()
            ->flatMap(function ($conversation) use ($user) {
                return $conversation->participants->where('id', '!=', $user->id)->pluck('id');
            });

        $friends = User::whereHas('friendships', function ($query) use ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
            })->where('status', 'accepted');
        })
            ->whereNotIn('id', $existingConversationUserIds)
            ->select(['id', 'name', 'email'])
            ->limit(20)
            ->get()
            ->map(function ($friend) {
                return [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'avatar' => $friend->avatar,
                    'online' => false, // TODO: implement online status tracking
                ];
            });

        return Inertia::render('event-city/social/messages-new', [
            'friends' => $friends,
        ]);
    }

    public function startConversation(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $user = Auth::user();
        $friendId = $request->input('user_id');

        // Check if users are friends
        if (! $user->isFriendsWith(User::find($friendId))) {
            return response()->json([
                'success' => false,
                'message' => 'You can only start conversations with friends',
            ], 403);
        }

        // Check if conversation already exists
        $existingConversation = Conversation::where('type', 'private')
            ->whereHas('participants', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereHas('participants', function ($query) use ($friendId) {
                $query->where('user_id', $friendId);
            })
            ->first();

        if ($existingConversation) {
            return response()->json([
                'success' => true,
                'conversation_id' => $existingConversation->id,
                'redirect_url' => route('social.messages.show', $existingConversation->id),
            ]);
        }

        // Create new conversation
        DB::transaction(function () use ($user, $friendId, $request, &$conversation) {
            $conversation = Conversation::create([
                'type' => 'private',
                'last_message_at' => now(),
            ]);

            // Add participants
            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
                'joined_at' => now(),
            ]);

            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'user_id' => $friendId,
                'joined_at' => now(),
            ]);

            // Send first message
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'content' => $request->input('message'),
                'type' => 'text',
            ]);
        });

        return response()->json([
            'success' => true,
            'conversation_id' => $conversation->id,
            'redirect_url' => route('social.messages.show', $conversation->id),
        ]);
    }
}

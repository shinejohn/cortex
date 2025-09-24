<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class SocialMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Mock conversations for now - in a real app, you'd have a Conversation model
        $conversations = [
            [
                'id' => 'conv-1',
                'participants' => [
                    [
                        'id' => 'user-234',
                        'name' => 'Jessica Taylor',
                        'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                        'online' => true,
                    ],
                ],
                'last_message' => [
                    'text' => 'Hey! Are you going to the concert tonight?',
                    'timestamp' => now()->subMinutes(15)->toISOString(),
                    'read' => true,
                    'sender' => 'user-234',
                ],
                'unread' => 0,
            ],
            [
                'id' => 'conv-2',
                'participants' => [
                    [
                        'id' => 'user-345',
                        'name' => 'Marcus Wilson',
                        'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                        'online' => false,
                    ],
                ],
                'last_message' => [
                    'text' => 'I just got tickets for the jazz festival next month!',
                    'timestamp' => now()->subHours(2)->toISOString(),
                    'read' => false,
                    'sender' => 'user-345',
                ],
                'unread' => 3,
            ],
        ];

        $selectedConversation = $request->route('conversation');
        $messages = [];

        if ($selectedConversation) {
            // Mock messages for the selected conversation
            $messages = [
                [
                    'id' => 'msg-1',
                    'text' => 'Hey there! How are you doing?',
                    'timestamp' => now()->subHours(2)->toISOString(),
                    'sender' => 'user-234',
                    'read' => true,
                ],
                [
                    'id' => 'msg-2',
                    'text' => 'I\'m doing great! Just got back from the venue tour.',
                    'timestamp' => now()->subHours(1)->toISOString(),
                    'sender' => $user->id,
                    'read' => true,
                ],
                [
                    'id' => 'msg-3',
                    'text' => 'That sounds awesome! How was it?',
                    'timestamp' => now()->subMinutes(30)->toISOString(),
                    'sender' => 'user-234',
                    'read' => true,
                ],
                [
                    'id' => 'msg-4',
                    'text' => 'It was amazing! The acoustics are incredible.',
                    'timestamp' => now()->subMinutes(15)->toISOString(),
                    'sender' => $user->id,
                    'read' => false,
                ],
            ];
        }

        return Inertia::render('social/messages-index', [
            'conversations' => $conversations,
            'selected_conversation' => $selectedConversation,
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

    public function sendMessage(Request $request, string $conversationId): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        // In a real app, you'd save the message to the database
        // and potentially broadcast it via WebSocket/Pusher

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
        ]);
    }

    public function newMessage(): Response
    {
        $user = Auth::user();

        // Get friends to start new conversations with
        $friends = User::whereHas('friendships', function ($query) use ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
            })->where('status', 'accepted');
        })->limit(20)->get();

        return Inertia::render('social/messages-new', [
            'friends' => $friends,
        ]);
    }
}

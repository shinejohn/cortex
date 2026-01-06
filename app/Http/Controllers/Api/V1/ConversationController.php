<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreConversationRequest;
use App\Http\Resources\Api\V1\ConversationResource;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ConversationController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $conversations = $user->conversations()
            ->with(['latestMessage', 'participants'])
            ->orderBy('last_message_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return $this->paginated($conversations);
    }

    public function show(Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        return $this->success(new ConversationResource($conversation->load(['participants', 'messages'])));
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $conversation = Conversation::create([
            'type' => $request->type ?? 'private',
            'title' => $request->title,
        ]);

        $participantIds = array_merge([$request->user()->id], $request->participant_ids ?? []);
        $conversation->participants()->attach($participantIds);

        return $this->success(new ConversationResource($conversation), 'Conversation created successfully', 201);
    }

    public function markAsRead(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $conversation->markAsReadForUser($request->user()->id);
        return $this->success(null, 'Conversation marked as read');
    }
}



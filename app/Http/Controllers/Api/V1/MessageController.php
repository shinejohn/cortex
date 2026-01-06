<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreMessageRequest;
use App\Http\Resources\Api\V1\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MessageController extends BaseController
{
    public function index(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $messages = $conversation->messages()->with('sender')->orderBy('created_at', 'desc')->paginate($request->get('per_page', 50));
        return $this->paginated($messages);
    }

    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        
        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'content' => $request->content,
            'type' => $request->type ?? 'text',
        ]);

        $conversation->update(['last_message_at' => now()]);

        return $this->success(new MessageResource($message), 'Message sent successfully', 201);
    }

    public function destroy(Message $message): JsonResponse
    {
        $this->authorize('delete', $message);
        $message->delete();
        return $this->noContent();
    }
}



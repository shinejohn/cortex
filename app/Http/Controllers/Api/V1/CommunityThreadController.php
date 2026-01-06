<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreCommunityThreadRequest;
use App\Http\Requests\Api\V1\UpdateCommunityThreadRequest;
use App\Http\Resources\Api\V1\CommunityThreadResource;
use App\Models\Community;
use App\Models\CommunityThread;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CommunityThreadController extends BaseController
{
    public function index(Request $request, Community $community): JsonResponse
    {
        $threads = $community->threads()->with(['user', 'replies'])->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));
        return $this->paginated($threads);
    }

    public function show(CommunityThread $communityThread): JsonResponse
    {
        return $this->success(new CommunityThreadResource($communityThread->load(['user', 'replies', 'community'])));
    }

    public function store(StoreCommunityThreadRequest $request, Community $community): JsonResponse
    {
        $thread = $community->threads()->create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
        ]);

        return $this->success(new CommunityThreadResource($thread), 'Thread created successfully', 201);
    }

    public function update(UpdateCommunityThreadRequest $request, CommunityThread $communityThread): JsonResponse
    {
        $this->authorize('update', $communityThread);
        $communityThread->update($request->validated());
        return $this->success(new CommunityThreadResource($communityThread), 'Thread updated successfully');
    }

    public function destroy(CommunityThread $communityThread): JsonResponse
    {
        $this->authorize('delete', $communityThread);
        $communityThread->delete();
        return $this->noContent();
    }
}



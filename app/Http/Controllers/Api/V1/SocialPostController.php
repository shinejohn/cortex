<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreSocialPostRequest;
use App\Http\Requests\Api\V1\UpdateSocialPostRequest;
use App\Http\Resources\Api\V1\SocialPostResource;
use App\Models\SocialPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SocialPostController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = SocialPost::query()->with(['user'])->where('is_active', true);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $posts = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($posts);
    }

    public function show(SocialPost $socialPost): JsonResponse
    {
        return $this->success(new SocialPostResource($socialPost->load(['user', 'likes', 'comments'])));
    }

    public function store(StoreSocialPostRequest $request): JsonResponse
    {
        $post = SocialPost::create([
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'media' => $request->media ?? [],
            'visibility' => $request->visibility ?? 'public',
        ]);

        return $this->success(new SocialPostResource($post), 'Post created successfully', 201);
    }

    public function update(UpdateSocialPostRequest $request, SocialPost $socialPost): JsonResponse
    {
        $this->authorize('update', $socialPost);
        $socialPost->update($request->validated());
        return $this->success(new SocialPostResource($socialPost), 'Post updated successfully');
    }

    public function destroy(SocialPost $socialPost): JsonResponse
    {
        $this->authorize('delete', $socialPost);
        $socialPost->delete();
        return $this->noContent();
    }

    public function like(Request $request, SocialPost $socialPost): JsonResponse
    {
        $socialPost->likes()->firstOrCreate(['user_id' => $request->user()->id]);
        return $this->success(null, 'Post liked');
    }

    public function unlike(Request $request, SocialPost $socialPost): JsonResponse
    {
        $socialPost->likes()->where('user_id', $request->user()->id)->delete();
        return $this->noContent();
    }
}



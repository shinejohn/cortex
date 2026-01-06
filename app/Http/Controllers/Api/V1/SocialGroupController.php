<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreSocialGroupRequest;
use App\Http\Requests\Api\V1\UpdateSocialGroupRequest;
use App\Http\Resources\Api\V1\SocialGroupResource;
use App\Models\SocialGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SocialGroupController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = SocialGroup::query()->where('is_active', true);

        if ($request->has('privacy')) {
            $query->where('privacy', $request->privacy);
        }

        $groups = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($groups);
    }

    public function show(SocialGroup $socialGroup): JsonResponse
    {
        return $this->success(new SocialGroupResource($socialGroup->load(['creator', 'members'])));
    }

    public function store(StoreSocialGroupRequest $request): JsonResponse
    {
        $group = SocialGroup::create([
            'name' => $request->name,
            'description' => $request->description,
            'creator_id' => $request->user()->id,
            'privacy' => $request->privacy ?? 'public',
        ]);

        return $this->success(new SocialGroupResource($group), 'Group created successfully', 201);
    }

    public function update(UpdateSocialGroupRequest $request, SocialGroup $socialGroup): JsonResponse
    {
        $this->authorize('update', $socialGroup);
        $socialGroup->update($request->validated());
        return $this->success(new SocialGroupResource($socialGroup), 'Group updated successfully');
    }

    public function join(Request $request, SocialGroup $socialGroup): JsonResponse
    {
        $socialGroup->members()->firstOrCreate(['user_id' => $request->user()->id, 'status' => 'approved']);
        return $this->success(null, 'Joined group');
    }

    public function leave(Request $request, SocialGroup $socialGroup): JsonResponse
    {
        $socialGroup->members()->where('user_id', $request->user()->id)->delete();
        return $this->noContent();
    }
}



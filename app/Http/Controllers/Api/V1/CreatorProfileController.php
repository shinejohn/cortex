<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreCreatorProfileRequest;
use App\Http\Requests\Api\V1\UpdateCreatorProfileRequest;
use App\Http\Resources\Api\V1\CreatorProfileResource;
use App\Models\CreatorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CreatorProfileController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $creators = CreatorProfile::query()->with(['user'])->approved()->paginate($request->get('per_page', 20));
        return $this->paginated($creators);
    }

    public function show(CreatorProfile $creatorProfile): JsonResponse
    {
        return $this->success(new CreatorProfileResource($creatorProfile->load(['user', 'podcasts'])));
    }

    public function store(StoreCreatorProfileRequest $request): JsonResponse
    {
        $profile = CreatorProfile::create($request->validated());
        return $this->success(new CreatorProfileResource($profile), 'Creator profile created successfully', 201);
    }

    public function update(UpdateCreatorProfileRequest $request, CreatorProfile $creatorProfile): JsonResponse
    {
        $this->authorize('update', $creatorProfile);
        $creatorProfile->update($request->validated());
        return $this->success(new CreatorProfileResource($creatorProfile), 'Creator profile updated successfully');
    }

    public function content(Request $request, CreatorProfile $creatorProfile): JsonResponse
    {
        $content = [
            'podcasts' => $creatorProfile->podcasts()->count(),
            'episodes' => $creatorProfile->podcasts()->withCount('episodes')->get()->sum('episodes_count'),
        ];
        return $this->success($content);
    }

    public function follow(Request $request, CreatorProfile $creatorProfile): JsonResponse
    {
        $creatorProfile->followers()->firstOrCreate(['user_id' => $request->user()->id]);
        $creatorProfile->increment('followers_count');
        return $this->success(null, 'Following creator');
    }
}



<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreCommunityRequest;
use App\Http\Requests\Api\V1\UpdateCommunityRequest;
use App\Http\Resources\Api\V1\CommunityResource;
use App\Http\Resources\Api\V1\Crm\SmbBusinessResource;
use App\Models\Community;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CommunityController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Community::query()->with(['workspace', 'createdBy'])->active();

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        $communities = $query->orderBy('name')->paginate($request->get('per_page', 20));

        return $this->paginated($communities);
    }

    public function show(Community $community): JsonResponse
    {
        return $this->success(new CommunityResource($community->load(['workspace', 'createdBy', 'threads', 'members'])));
    }

    public function store(StoreCommunityRequest $request): JsonResponse
    {
        $community = Community::create([
            'workspace_id' => $request->workspace_id,
            'created_by' => $request->user()->id,
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'description' => $request->description,
        ]);

        return $this->success(new CommunityResource($community), 'Community created successfully', 201);
    }

    public function update(UpdateCommunityRequest $request, Community $community): JsonResponse
    {
        $this->authorize('update', $community);
        $community->update($request->validated());

        return $this->success(new CommunityResource($community), 'Community updated successfully');
    }

    public function threads(Request $request, Community $community): JsonResponse
    {
        $threads = $community->threads()->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($threads);
    }

    public function members(Request $request, Community $community): JsonResponse
    {
        $members = $community->members()->active()->paginate($request->get('per_page', 20));

        return $this->paginated($members);
    }

    public function businesses(Request $request, Community $community): JsonResponse
    {
        $query = $community->smbBusinesses()->with(['tenant']);

        if ($request->has('category')) {
            $query->whereJsonContains('place_types', $request->category);
        }
        if ($request->has('fibonacco_status')) {
            $query->where('fibonacco_status', $request->fibonacco_status);
        }
        if ($request->has('min_profile_completeness')) {
            $query->where('profile_completeness', '>=', (int) $request->min_profile_completeness);
        }

        $businesses = $query->orderBy('display_name')->paginate($request->get('per_page', 20));

        return $this->paginated($businesses->through(fn ($b) => new SmbBusinessResource($b)));
    }
}

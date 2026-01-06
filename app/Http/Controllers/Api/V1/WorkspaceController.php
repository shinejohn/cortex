<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreWorkspaceRequest;
use App\Http\Requests\Api\V1\UpdateWorkspaceRequest;
use App\Http\Resources\Api\V1\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Workspaces
 * 
 * Workspace management endpoints for creating and managing workspaces.
 */
final class WorkspaceController extends BaseController
{
    /**
     * List user's workspaces.
     * 
     * Returns all workspaces the authenticated user is a member of.
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {
     *       "id": "550e8400-e29b-41d4-a716-446655440000",
     *       "name": "My Workspace",
     *       "slug": "my-workspace"
     *     }
     *   ]
     * }
     * 
     * @authenticated
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $workspaces = $user->workspaceMemberships()
            ->with('workspace')
            ->get()
            ->pluck('workspace');

        return $this->success(WorkspaceResource::collection($workspaces));
    }

    /**
     * Get workspace details.
     * 
     * @urlParam workspace string required The workspace UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "My Workspace",
     *     "slug": "my-workspace",
     *     "owner": {...},
     *     "members": [...]
     *   }
     * }
     * 
     * @authenticated
     */
    public function show(Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        return $this->success(new WorkspaceResource($workspace->load(['owner', 'members'])));
    }

    /**
     * Create new workspace.
     * 
     * @bodyParam name string required The workspace name. Example: My Workspace
     * @bodyParam slug string The workspace slug (auto-generated if not provided). Example: my-workspace
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Workspace created successfully",
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "My Workspace",
     *     "slug": "my-workspace"
     *   }
     * }
     * 
     * @authenticated
     */
    public function store(StoreWorkspaceRequest $request): JsonResponse
    {
        $workspace = Workspace::create([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'owner_id' => $request->user()->id,
        ]);

        // Add creator as owner
        $workspace->members()->create([
            'user_id' => $request->user()->id,
            'role' => 'owner',
        ]);

        return $this->success(new WorkspaceResource($workspace), 'Workspace created successfully', 201);
    }

    /**
     * Update workspace settings.
     * 
     * @urlParam workspace string required The workspace UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The workspace name. Example: Updated Workspace Name
     * @bodyParam slug string The workspace slug. Example: updated-workspace-slug
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Workspace updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateWorkspaceRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);

        $workspace->update($request->validated());

        return $this->success(new WorkspaceResource($workspace), 'Workspace updated successfully');
    }

    /**
     * Delete workspace.
     * 
     * @urlParam workspace string required The workspace UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     * 
     * @authenticated
     */
    public function destroy(Workspace $workspace): JsonResponse
    {
        $this->authorize('delete', $workspace);

        $workspace->delete();

        return $this->noContent();
    }
}


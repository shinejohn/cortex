<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreWorkspaceMemberRequest;
use App\Http\Requests\Api\V1\UpdateWorkspaceMemberRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Workspace;
use App\Models\WorkspaceMembership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Workspaces
 * 
 * Workspace member management endpoints.
 */
final class WorkspaceMemberController extends BaseController
{
    /**
     * List workspace members.
     * 
     * @urlParam workspace string required The workspace UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @authenticated
     */
    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $members = $workspace->members()
            ->with('user')
            ->paginate($request->get('per_page', 20));

        return $this->paginated($members);
    }

    /**
     * Add member to workspace.
     * 
     * @urlParam workspace string required The workspace UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam user_id string required The user UUID to add. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam role string The member role (owner, admin, editor, viewer, member). Example: member
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Member added successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StoreWorkspaceMemberRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);

        $membership = $workspace->members()->create([
            'user_id' => $request->user_id,
            'role' => $request->role ?? 'member',
        ]);

        return $this->success($membership->load('user'), 'Member added successfully', 201);
    }

    /**
     * Update member role.
     * 
     * @urlParam workspace string required The workspace UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam userId string required The user UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam role string required The new role. Example: editor
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Member role updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateWorkspaceMemberRequest $request, Workspace $workspace, string $userId): JsonResponse
    {
        $this->authorize('update', $workspace);

        $membership = $workspace->members()->where('user_id', $userId)->firstOrFail();
        $membership->update(['role' => $request->role]);

        return $this->success($membership->load('user'), 'Member role updated successfully');
    }

    /**
     * Remove member from workspace.
     * 
     * @urlParam workspace string required The workspace UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam userId string required The user UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     * 
     * @authenticated
     */
    public function destroy(Workspace $workspace, string $userId): JsonResponse
    {
        $this->authorize('update', $workspace);

        $membership = $workspace->members()->where('user_id', $userId)->firstOrFail();
        $membership->delete();

        return $this->noContent();
    }
}


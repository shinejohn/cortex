<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreWorkspaceInvitationRequest;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Workspaces
 * 
 * Workspace invitation management endpoints.
 */
final class WorkspaceInvitationController extends BaseController
{
    /**
     * List pending invitations.
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

        $invitations = $workspace->invitations()
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->paginate($request->get('per_page', 20));

        return $this->paginated($invitations);
    }

    /**
     * Send invitation.
     * 
     * @urlParam workspace string required The workspace UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam email string required The email address to invite. Example: user@example.com
     * @bodyParam role string The role for the invited user. Example: member
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Invitation sent successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function store(StoreWorkspaceInvitationRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);

        $invitation = $workspace->invitations()->create([
            'invited_by' => $request->user()->id,
            'email' => $request->email,
            'role' => $request->role ?? 'member',
            'token' => WorkspaceInvitation::generateToken(),
            'expires_at' => now()->addDays(7),
        ]);

        // TODO: Send invitation email

        return $this->success($invitation, 'Invitation sent successfully', 201);
    }

    /**
     * Accept invitation.
     * 
     * @urlParam token string required The invitation token. Example: abc123xyz
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Invitation accepted successfully",
     *   "data": null
     * }
     * 
     * @response 403 {
     *   "success": false,
     *   "message": "This invitation is not for your email address"
     * }
     * 
     * @authenticated
     */
    public function accept(Request $request, string $token): JsonResponse
    {
        $invitation = WorkspaceInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $user = $request->user();

        if ($user->email !== $invitation->email) {
            return $this->error('This invitation is not for your email address', 'INVALID_INVITATION', [], 403);
        }

        // Create membership
        $invitation->workspace->members()->create([
            'user_id' => $user->id,
            'role' => $invitation->role,
        ]);

        $invitation->update(['accepted_at' => now()]);

        return $this->success(null, 'Invitation accepted successfully');
    }

    /**
     * Cancel invitation.
     * 
     * @urlParam invitation string required The invitation UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     * 
     * @authenticated
     */
    public function destroy(WorkspaceInvitation $invitation): JsonResponse
    {
        $this->authorize('update', $invitation->workspace);

        $invitation->delete();

        return $this->noContent();
    }
}


<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Dto\Workspace\InvitationAcceptanceResult;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMembership;
use App\Services\Workspace\WorkspaceInvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class WorkspaceController extends Controller
{
    public function store(Request $request)
    {
        if (! config('makerkit.workspaces.can_create_workspaces') || ! config('makerkit.workspaces.enabled')) {
            abort(404, 'Workspaces are not enabled');
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workspace = Workspace::create([
            'name' => $request->name,
            'owner_id' => $request->user()->id,
            'slug' => Str::slug($request->name.'Workspace').Str::random(5),
        ]);

        WorkspaceMembership::create([
            'workspace_id' => $workspace->id,
            'user_id' => $request->user()->id,
            'role' => 'owner',
        ]);

        $request->user()->current_workspace_id = $workspace->id;
        $request->user()->save();

        return redirect()->route('dashboard')->with('success', 'Workspace created successfully');
    }

    /**
     * Switch the user's current workspace
     */
    public function switch(Request $request): RedirectResponse
    {
        if (! config('makerkit.workspaces.enabled')) {
            abort(404, 'Workspaces are not enabled');
        }

        $request->validate([
            'workspace_id' => 'required|string',
        ]);

        /** @var User $user */
        $user = Auth::user();

        if (! $user) {
            return back()->withErrors(['error' => 'User not authenticated']);
        }

        $workspaceId = $request->input('workspace_id');

        // Verify user belongs to this workspace
        $membership = $user->workspaceMemberships()
            ->where('workspace_memberships.workspace_id', $workspaceId)
            ->first();

        if (! $membership) {
            return back()->withErrors(['error' => 'You do not have access to this workspace']);
        }

        // Update user's current workspace
        $user->current_workspace_id = $workspaceId;
        $user->save();

        return back()->with('success', 'Workspace switched successfully');
    }

    /**
     * Show the invitation acceptance page
     */
    public function showInvitation(string $token): Response|RedirectResponse
    {
        if (! config('makerkit.workspaces.enabled')) {
            abort(404, 'Workspaces are not enabled');
        }

        $invitation = WorkspaceInvitation::where('token', $token)->first();

        if (! $invitation) {
            return redirect()->route('home')->withErrors(['error' => 'Invalid invitation link']);
        }

        if (! $invitation->isValid()) {
            $message = $invitation->isExpired() ? 'This invitation has expired' : 'This invitation has already been accepted';

            return redirect()->route('home')->withErrors(['error' => $message]);
        }

        // Check if user is already logged in
        if (Auth::check()) {
            return $this->acceptInvitationForLoggedInUser($invitation);
        }

        // Check if user exists but is not logged in
        $existingUser = User::where('email', $invitation->email)->first();

        return Inertia::render('auth/workspace-invitation', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'workspace_name' => $invitation->workspace->name,
                'role' => $invitation->role,
                'inviter_name' => $invitation->inviter->name,
                'expires_at' => $invitation->expires_at,
            ],
            'userExists' => (bool) $existingUser,
            'loginUrl' => route('login', ['invitation' => $invitation->token]),
            'registerUrl' => route('register', ['invitation' => $invitation->token]),
        ]);
    }

    /**
     * Accept invitation for logged-in user
     */
    public function acceptInvitationForLoggedInUser(WorkspaceInvitation $invitation): RedirectResponse
    {
        if (! config('makerkit.workspaces.enabled')) {
            abort(404, 'Workspaces are not enabled');
        }

        /** @var User $user */
        $user = Auth::user();

        $invitationService = app(WorkspaceInvitationService::class);
        $result = $invitationService->acceptInvitationForAuthenticatedUser($invitation, $user);

        if ($result->wasSuccessful()) {
            return redirect()->route('dashboard')->with('success', $result->getMessage());
        }

        if ($result->getFlashType() === 'warning') {
            return redirect()->route('dashboard')->with('warning', $result->getMessage());
        }

        return redirect()->route('home')->withErrors(['error' => $result->getMessage()]);
    }

    /**
     * Accept invitation by token (called from auth controllers)
     */
    public function acceptInvitationByToken(string $token, User $user): InvitationAcceptanceResult
    {
        if (! config('makerkit.workspaces.enabled')) {
            return new InvitationAcceptanceResult(
                success: false,
                message: 'Workspaces are not enabled',
                type: 'error'
            );
        }

        $invitationService = app(WorkspaceInvitationService::class);

        return $invitationService->acceptInvitationByToken($token, $user);
    }
}

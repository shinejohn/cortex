<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMembership;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('WorkspaceController', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    });

    describe('store', function () {
        it('creates a new workspace when workspaces are enabled', function () {
            Config::set('makerkit.workspaces.enabled', true);

            $workspaceName = 'Test Workspace';

            $response = $this->post(route('workspaces.store'), [
                'name' => $workspaceName,
            ]);

            $response->assertRedirect(route('dashboard'))
                ->assertSessionHas('success', 'Workspace created successfully');

            $this->assertDatabaseHas('workspaces', [
                'name' => $workspaceName,
                'owner_id' => $this->user->id,
            ]);

            $workspace = Workspace::where('name', $workspaceName)->first();

            // Assert membership was created
            $this->assertDatabaseHas('workspace_memberships', [
                'workspace_id' => $workspace->id,
                'user_id' => $this->user->id,
                'role' => 'owner',
            ]);

            // Assert user's current workspace was updated
            $this->user->refresh();
            expect($this->user->current_workspace_id)->toBe($workspace->id);
        });

        it('returns 404 when workspaces are disabled', function () {
            Config::set('makerkit.workspaces.enabled', false);

            $response = $this->post(route('workspaces.store'), [
                'name' => 'Test Workspace',
            ]);

            $response->assertNotFound();
            $this->assertDatabaseEmpty('workspaces');
        });

        it('validates required name field', function () {
            Config::set('makerkit.workspaces.enabled', true);

            $response = $this->post(route('workspaces.store'), []);

            $response->assertSessionHasErrors(['name']);
            $this->assertDatabaseEmpty('workspaces');
        });

        it('validates name max length', function () {
            Config::set('makerkit.workspaces.enabled', true);

            $response = $this->post(route('workspaces.store'), [
                'name' => str_repeat('a', 256),
            ]);

            $response->assertSessionHasErrors(['name']);
            $this->assertDatabaseEmpty('workspaces');
        });

        it('generates unique slug for workspace', function () {
            Config::set('makerkit.workspaces.enabled', true);

            $workspaceName = 'Test Workspace';

            // Create first workspace
            $this->post(route('workspaces.store'), ['name' => $workspaceName]);

            // Create second workspace with same name
            $this->post(route('workspaces.store'), ['name' => $workspaceName]);

            $workspaces = Workspace::where('name', $workspaceName)->get();
            expect($workspaces)->toHaveCount(2);

            // Ensure slugs are different
            expect($workspaces->pluck('slug')->unique())->toHaveCount(2);
        });
    });

    describe('switch', function () {
        beforeEach(function () {
            $this->workspace = Workspace::factory()->create();
            $this->membership = WorkspaceMembership::factory()->create([
                'workspace_id' => $this->workspace->id,
                'user_id' => $this->user->id,
                'role' => 'member',
            ]);
        });

        it('switches to workspace when user is a member', function () {
            $response = $this->post(route('workspaces.switch'), [
                'workspace_id' => $this->workspace->id,
            ]);

            $response->assertRedirect()
                ->assertSessionHas('success', 'Workspace switched successfully');

            $this->user->refresh();
            expect($this->user->current_workspace_id)->toBe($this->workspace->id);
        });

        it('returns error when user is not a member', function () {
            $otherWorkspace = Workspace::factory()->create();

            $response = $this->post(route('workspaces.switch'), [
                'workspace_id' => $otherWorkspace->id,
            ]);

            $response->assertRedirect()
                ->assertSessionHasErrors(['error' => 'You do not have access to this workspace']);

            $this->user->refresh();
            expect($this->user->current_workspace_id)->not()->toBe($otherWorkspace->id);
        });

        it('validates required workspace_id field', function () {
            $response = $this->post(route('workspaces.switch'), []);

            $response->assertSessionHasErrors(['workspace_id']);
        });

        it('requires authentication', function () {
            Auth::logout();

            $response = $this->post(route('workspaces.switch'), [
                'workspace_id' => $this->workspace->id,
            ]);

            $response->assertRedirect(route('login'));
        });

        it('returns 404 when workspaces are disabled', function () {
            Config::set('makerkit.workspaces.enabled', false);

            $response = $this->post(route('workspaces.switch'), [
                'workspace_id' => $this->workspace->id,
            ]);

            $response->assertNotFound();
        });
    });

    describe('showInvitation', function () {
        beforeEach(function () {
            $this->workspace = Workspace::factory()->create();
            $this->inviter = User::factory()->create();
        });

        it('shows invitation page for valid token', function () {
            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => 'test@example.com',
                'role' => 'member',
            ]);

            Auth::logout();

            $response = $this->get(route('workspace.invitation.accept', $invitation->token));

            $response->assertSuccessful()
                ->assertInertia(
                    fn ($page) => $page
                        ->component('auth/workspace-invitation')
                        ->has('invitation')
                        ->where('invitation.token', $invitation->token)
                        ->where('invitation.email', 'test@example.com')
                        ->where('invitation.workspace_name', $this->workspace->name)
                        ->where('invitation.role', 'member')
                        ->where('invitation.inviter_name', $this->inviter->name)
                        ->where('userExists', false)
                );
        });

        it('redirects with error for invalid token', function () {
            Auth::logout();

            $response = $this->get(route('workspace.invitation.accept', 'invalid-token'));

            $response->assertRedirect(route('home'))
                ->assertSessionHasErrors(['error' => 'Invalid invitation link']);
        });

        it('redirects with error for expired invitation', function () {
            $invitation = WorkspaceInvitation::factory()->expired()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
            ]);

            Auth::logout();

            $response = $this->get(route('workspace.invitation.accept', $invitation->token));

            $response->assertRedirect(route('home'))
                ->assertSessionHasErrors(['error' => 'This invitation has expired']);
        });

        it('redirects with error for accepted invitation', function () {
            $invitation = WorkspaceInvitation::factory()->accepted()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
            ]);

            Auth::logout();

            $response = $this->get(route('workspace.invitation.accept', $invitation->token));

            $response->assertRedirect(route('home'))
                ->assertSessionHasErrors(['error' => 'This invitation has already been accepted']);
        });

        it('automatically accepts invitation for logged in user', function () {
            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
                'role' => 'member',
            ]);

            $response = $this->get(route('workspace.invitation.accept', $invitation->token));

            $response->assertRedirect(route('dashboard'))
                ->assertSessionHas('success', 'Successfully joined the workspace!');

            // Assert membership was created
            $this->assertDatabaseHas('workspace_memberships', [
                'workspace_id' => $this->workspace->id,
                'user_id' => $this->user->id,
                'role' => 'member',
            ]);

            // Assert invitation was marked as accepted
            $invitation->refresh();
            expect($invitation->accepted_at)->not()->toBeNull();
        });

        it('shows user exists flag when user exists but not logged in', function () {
            $existingUser = User::factory()->create(['email' => 'existing@example.com']);

            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => 'existing@example.com',
                'role' => 'member',
            ]);

            Auth::logout();

            $response = $this->get(route('workspace.invitation.accept', $invitation->token));

            $response->assertSuccessful()
                ->assertInertia(
                    fn ($page) => $page
                        ->component('auth/workspace-invitation')
                        ->where('userExists', true)
                );
        });

        it('returns 404 when workspaces are disabled', function () {
            Config::set('makerkit.workspaces.enabled', false);

            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => 'test@example.com',
                'role' => 'member',
            ]);

            Auth::logout();

            $response = $this->get(route('workspace.invitation.accept', $invitation->token));

            $response->assertNotFound();
        });
    });

    describe('acceptInvitationForLoggedInUser', function () {
        beforeEach(function () {
            $this->workspace = Workspace::factory()->create();
            $this->inviter = User::factory()->create();
            $this->invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
                'role' => 'member',
            ]);
        });

        it('returns 404 when workspaces are disabled', function () {
            Config::set('makerkit.workspaces.enabled', false);

            $controller = new App\Http\Controllers\WorkspaceController();

            $this->expectException(Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class);
            $this->expectExceptionMessage('Workspaces are not enabled');

            $controller->acceptInvitationForLoggedInUser($this->invitation);
        });
    });

    describe('acceptInvitationByToken', function () {
        beforeEach(function () {
            $this->workspace = Workspace::factory()->create();
            $this->inviter = User::factory()->create();
            $this->invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
                'role' => 'member',
            ]);
        });

        it('returns error result when workspaces are disabled', function () {
            Config::set('makerkit.workspaces.enabled', false);

            $controller = new App\Http\Controllers\WorkspaceController();

            $result = $controller->acceptInvitationByToken($this->invitation->token, $this->user);

            expect($result->wasSuccessful())->toBeFalse();
            expect($result->getMessage())->toBe('Workspaces are not enabled');
            expect($result->getFlashType())->toBe('error');
        });
    });
});

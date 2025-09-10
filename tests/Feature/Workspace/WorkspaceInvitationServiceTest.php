<?php

declare(strict_types=1);

use App\Dto\Workspace\InvitationAcceptanceResult;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMembership;
use App\Services\Workspace\WorkspaceInvitationService;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('WorkspaceInvitationService', function () {
    beforeEach(function () {
        $this->service = app(WorkspaceInvitationService::class);
        $this->user = User::factory()->create(['email' => 'test@example.com']);
        $this->workspace = Workspace::factory()->create();
        $this->inviter = User::factory()->create();
    });

    describe('acceptInvitationByToken', function () {
        it('accepts valid invitation successfully', function () {
            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
                'role' => 'member',
            ]);

            $result = $this->service->acceptInvitationByToken($invitation->token, $this->user);

            expect($result)->toBeInstanceOf(InvitationAcceptanceResult::class);
            expect($result->wasSuccessful())->toBeTrue();
            expect($result->getMessage())->toBe('Successfully joined the workspace!');

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

        it('returns error for invalid token', function () {
            $result = $this->service->acceptInvitationByToken('invalid-token', $this->user);

            expect($result->wasSuccessful())->toBeFalse();
            expect($result->getMessage())->toBe('Invalid invitation token');
        });

        it('returns error for expired invitation', function () {
            $invitation = WorkspaceInvitation::factory()->expired()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
            ]);

            $result = $this->service->acceptInvitationByToken($invitation->token, $this->user);

            expect($result->wasSuccessful())->toBeFalse();
            expect($result->getMessage())->toBe('This invitation has expired');
        });

        it('returns error for accepted invitation', function () {
            $invitation = WorkspaceInvitation::factory()->accepted()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
            ]);

            $result = $this->service->acceptInvitationByToken($invitation->token, $this->user);

            expect($result->wasSuccessful())->toBeFalse();
            expect($result->getMessage())->toBe('This invitation has already been accepted');
        });

        it('returns error for mismatched email', function () {
            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => 'different@example.com',
                'role' => 'member',
            ]);

            $result = $this->service->acceptInvitationByToken($invitation->token, $this->user);

            expect($result->wasSuccessful())->toBeFalse();
            expect($result->getMessage())->toBe('This invitation is for a different email address');
        });

        it('returns warning for existing member', function () {
            // Create existing membership
            WorkspaceMembership::factory()->create([
                'workspace_id' => $this->workspace->id,
                'user_id' => $this->user->id,
                'role' => 'member',
            ]);

            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
                'role' => 'admin',
            ]);

            $result = $this->service->acceptInvitationByToken($invitation->token, $this->user);

            expect($result->wasSuccessful())->toBeFalse();
            expect($result->getMessage())->toBe('You are already a member of this workspace');
            expect($result->getFlashType())->toBe('warning');
        });

        it('sets workspace as current when user has no current workspace', function () {
            expect($this->user->current_workspace_id)->toBeNull();

            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
                'role' => 'member',
            ]);

            $this->service->acceptInvitationByToken($invitation->token, $this->user);

            $this->user->refresh();
            expect($this->user->current_workspace_id)->toBe($this->workspace->id);
        });

        it('does not change current workspace when user already has one', function () {
            $currentWorkspace = Workspace::factory()->create();
            $this->user->update(['current_workspace_id' => $currentWorkspace->id]);

            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
                'role' => 'member',
            ]);

            $this->service->acceptInvitationByToken($invitation->token, $this->user);

            $this->user->refresh();
            expect($this->user->current_workspace_id)->toBe($currentWorkspace->id);
        });
    });

    describe('validateInvitationToken', function () {
        it('returns invitation for valid token', function () {
            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
            ]);

            $result = $this->service->validateInvitationToken($invitation->token);

            expect($result)->toBeInstanceOf(WorkspaceInvitation::class);
            expect($result->id)->toBe($invitation->id);
        });

        it('returns null for invalid token', function () {
            $result = $this->service->validateInvitationToken('invalid-token');

            expect($result)->toBeNull();
        });

        it('returns null for expired invitation', function () {
            $invitation = WorkspaceInvitation::factory()->expired()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
            ]);

            $result = $this->service->validateInvitationToken($invitation->token);

            expect($result)->toBeNull();
        });

        it('returns null for accepted invitation', function () {
            $invitation = WorkspaceInvitation::factory()->accepted()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
            ]);

            $result = $this->service->validateInvitationToken($invitation->token);

            expect($result)->toBeNull();
        });
    });

    describe('canUserAcceptInvitation', function () {
        it('returns true when user can accept invitation', function () {
            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
            ]);

            $result = $this->service->canUserAcceptInvitation($invitation, $this->user);

            expect($result)->toBeTrue();
        });

        it('returns false when email does not match', function () {
            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => 'different@example.com',
            ]);

            $result = $this->service->canUserAcceptInvitation($invitation, $this->user);

            expect($result)->toBeFalse();
        });

        it('returns false when user is already a member', function () {
            WorkspaceMembership::factory()->create([
                'workspace_id' => $this->workspace->id,
                'user_id' => $this->user->id,
                'role' => 'member',
            ]);

            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
            ]);

            $result = $this->service->canUserAcceptInvitation($invitation, $this->user);

            expect($result)->toBeFalse();
        });
    });

    describe('acceptInvitationForAuthenticatedUser', function () {
        it('accepts invitation for authenticated user successfully', function () {
            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
                'role' => 'admin',
            ]);

            $result = $this->service->acceptInvitationForAuthenticatedUser($invitation, $this->user);

            expect($result->wasSuccessful())->toBeTrue();
            expect($result->getMessage())->toBe('Successfully joined the workspace!');

            // Assert membership was created
            $this->assertDatabaseHas('workspace_memberships', [
                'workspace_id' => $this->workspace->id,
                'user_id' => $this->user->id,
                'role' => 'admin',
            ]);
        });

        it('returns error for mismatched email', function () {
            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => 'different@example.com',
                'role' => 'member',
            ]);

            $result = $this->service->acceptInvitationForAuthenticatedUser($invitation, $this->user);

            expect($result->wasSuccessful())->toBeFalse();
            expect($result->getMessage())->toBe('This invitation is for a different email address. Please log out and try again.');
        });

        it('returns warning when user is already a member', function () {
            WorkspaceMembership::factory()->create([
                'workspace_id' => $this->workspace->id,
                'user_id' => $this->user->id,
                'role' => 'member',
            ]);

            $invitation = WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->inviter->id,
                'email' => $this->user->email,
                'role' => 'admin',
            ]);

            $result = $this->service->acceptInvitationForAuthenticatedUser($invitation, $this->user);

            expect($result->wasSuccessful())->toBeFalse();
            expect($result->getMessage())->toBe('You are already a member of this workspace.');
            expect($result->getFlashType())->toBe('warning');
        });
    });
});

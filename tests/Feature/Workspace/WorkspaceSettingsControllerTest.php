<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembership;
use Illuminate\Support\Facades\Config;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('WorkspaceSettingsController', function () {
    beforeEach(function () {
        Config::set('makerkit.workspaces.enabled', true);
        $this->user = User::factory()->create();
        $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
        $this->membership = WorkspaceMembership::factory()->owner()->create([
            'workspace_id' => $this->workspace->id,
            'user_id' => $this->user->id,
        ]);
        $this->user->update(['current_workspace_id' => $this->workspace->id]);
        $this->actingAs($this->user);
    });

    describe('showOverview', function () {
        it('shows workspace overview for workspace owner', function () {
            $response = $this->get(route('settings.workspace'));

            $response->assertSuccessful()
                ->assertInertia(
                    fn ($page) => $page
                        ->component('event-city/settings/workspace/overview')
                        ->has('workspace')
                        ->where('workspace.id', $this->workspace->id)
                        ->where('workspace.name', $this->workspace->name)
                        ->where('canManage', true)
                );
        });
    });

    describe('update', function () {
        it('updates workspace when user has permission', function () {
            $response = $this->patch(route('settings.workspace.update'), [
                'name' => 'Updated Workspace Name',
            ]);

            $response->assertRedirect()
                ->assertSessionHas('success', 'Workspace updated successfully');

            $this->assertDatabaseHas('workspaces', [
                'id' => $this->workspace->id,
                'name' => 'Updated Workspace Name',
            ]);
        });
    });

    describe('when workspaces are disabled', function () {
        beforeEach(function () {
            Config::set('makerkit.workspaces.enabled', false);
        });

        it('showOverview returns 404', function () {
            $response = $this->get(route('settings.workspace'));

            $response->assertNotFound();
        });

        it('showMembers returns 404', function () {
            $response = $this->get(route('settings.workspace.members'));

            $response->assertNotFound();
        });

        it('update returns 404', function () {
            $response = $this->patch(route('settings.workspace.update'), [
                'name' => 'Updated Workspace Name',
            ]);

            $response->assertNotFound();
        });

        it('inviteUser returns 404', function () {
            $response = $this->post(route('settings.workspace.invite'), [
                'email' => 'test@example.com',
                'role' => 'member',
            ]);

            $response->assertNotFound();
        });

        it('updateMemberRole returns 404', function () {
            $membership = WorkspaceMembership::factory()->create([
                'workspace_id' => $this->workspace->id,
                'role' => 'member',
            ]);

            $response = $this->patch(route('settings.workspace.members.update', $membership), [
                'role' => 'admin',
            ]);

            $response->assertNotFound();
        });

        it('removeMember returns 404', function () {
            $membership = WorkspaceMembership::factory()->create([
                'workspace_id' => $this->workspace->id,
                'role' => 'member',
            ]);

            $response = $this->delete("/settings/workspace/members/{$membership->id}");

            $response->assertNotFound();
        });

        it('cancelInvitation returns 404', function () {
            $invitation = App\Models\WorkspaceInvitation::factory()->pending()->create([
                'workspace_id' => $this->workspace->id,
                'invited_by' => $this->user->id,
            ]);

            $response = $this->delete("/settings/workspace/invitations/{$invitation->id}");

            $response->assertNotFound();
        });
    });
});

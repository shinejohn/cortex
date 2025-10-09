<?php

declare(strict_types=1);

use App\Filament\Resources\Workspaces\Pages\EditWorkspace;
use App\Filament\Resources\Workspaces\Pages\ListWorkspaces;
use App\Models\User;
use App\Models\Workspace;
use App\Services\StripeConnectService;
use Filament\Actions\DeleteAction;
use Filament\Actions\Testing\TestAction;
use Livewire\Livewire;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('WorkspaceResource List Page', function () {
    beforeEach(function () {
        $this->admin = User::factory()->create();
        $this->actingAs($this->admin);
    });

    it('can load the list page', function () {
        $workspaces = Workspace::factory()->count(5)->create();

        Livewire::test(ListWorkspaces::class)
            ->assertOk()
            ->assertCanSeeTableRecords($workspaces);
    });

    it('displays workspace name and owner in table', function () {
        $workspace = Workspace::factory()->create([
            'name' => 'Test Workspace',
        ]);

        Livewire::test(ListWorkspaces::class)
            ->assertCanSeeTableRecords([$workspace])
            ->assertTableColumnStateSet('name', 'Test Workspace', record: $workspace);
    });

    it('shows stripe connection status correctly', function () {
        $connectedWorkspace = Workspace::factory()->create([
            'stripe_connect_id' => 'acct_test123',
        ]);

        $notConnectedWorkspace = Workspace::factory()->create([
            'stripe_connect_id' => null,
        ]);

        Livewire::test(ListWorkspaces::class)
            ->assertCanSeeTableRecords([$connectedWorkspace, $notConnectedWorkspace]);
    });

    it('can filter workspaces by admin approval status', function () {
        $approvedWorkspace = Workspace::factory()->create([
            'stripe_admin_approved' => true,
        ]);

        $unapprovedWorkspace = Workspace::factory()->create([
            'stripe_admin_approved' => false,
        ]);

        Livewire::test(ListWorkspaces::class)
            ->filterTable('stripe_admin_approved', true)
            ->assertCanSeeTableRecords([$approvedWorkspace])
            ->assertCanNotSeeTableRecords([$unapprovedWorkspace]);
    });

    it('can filter workspaces by stripe account connection', function () {
        $connectedWorkspace = Workspace::factory()->create([
            'stripe_connect_id' => 'acct_test123',
        ]);

        $notConnectedWorkspace = Workspace::factory()->create([
            'stripe_connect_id' => null,
        ]);

        Livewire::test(ListWorkspaces::class)
            ->filterTable('has_stripe_account', true)
            ->assertCanSeeTableRecords([$connectedWorkspace])
            ->assertCanNotSeeTableRecords([$notConnectedWorkspace]);
    });

    it('can refresh stripe capabilities for connected workspace', function () {
        $workspace = Workspace::factory()->create([
            'stripe_connect_id' => 'acct_test123',
            'stripe_charges_enabled' => false,
            'stripe_payouts_enabled' => false,
        ]);

        $mock = $this->mock(StripeConnectService::class);
        $mock->shouldReceive('updateWorkspaceCapabilities')
            ->once()
            ->with(Mockery::on(fn ($w) => $w->id === $workspace->id))
            ->andReturnUsing(function ($w) {
                $w->update([
                    'stripe_charges_enabled' => true,
                    'stripe_payouts_enabled' => true,
                ]);
            });

        Livewire::test(ListWorkspaces::class)
            ->callAction(TestAction::make('refreshCapabilities')->table($workspace))
            ->assertNotified();

        expect($workspace->refresh())
            ->stripe_charges_enabled->toBeTrue()
            ->stripe_payouts_enabled->toBeTrue();
    });

    it('cannot refresh capabilities for workspace without stripe account', function () {
        $workspace = Workspace::factory()->create([
            'stripe_connect_id' => null,
        ]);

        Livewire::test(ListWorkspaces::class)
            ->assertActionHidden(TestAction::make('refreshCapabilities')->table($workspace));
    });
});

describe('WorkspaceResource Edit Page', function () {
    beforeEach(function () {
        $this->admin = User::factory()->create();
        $this->actingAs($this->admin);
    });

    it('can load the edit page', function () {
        $workspace = Workspace::factory()->create();

        Livewire::test(EditWorkspace::class, [
            'record' => $workspace->id,
        ])
            ->assertOk()
            ->assertSchemaStateSet([
                'owner_id' => $workspace->owner_id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
            ]);
    });

    it('can update admin approval status', function () {
        $workspace = Workspace::factory()->create([
            'stripe_admin_approved' => false,
        ]);

        Livewire::test(EditWorkspace::class, [
            'record' => $workspace->id,
        ])
            ->fillForm([
                'stripe_admin_approved' => true,
            ])
            ->call('save')
            ->assertNotified();

        expect($workspace->refresh()->stripe_admin_approved)->toBeTrue();
    });

    it('can open stripe dashboard for connected workspace', function () {
        $workspace = Workspace::factory()->create([
            'stripe_connect_id' => 'acct_test123',
        ]);

        $mock = $this->mock(StripeConnectService::class);
        $mock->shouldReceive('createDashboardLink')
            ->once()
            ->with(Mockery::on(fn ($w) => $w->id === $workspace->id))
            ->andReturn('https://connect.stripe.com/express/acct_test123');

        Livewire::test(EditWorkspace::class, [
            'record' => $workspace->id,
        ])
            ->assertActionVisible('viewStripeDashboard')
            ->callAction('viewStripeDashboard');
    });

    it('cannot open stripe dashboard for workspace without account', function () {
        $workspace = Workspace::factory()->create([
            'stripe_connect_id' => null,
        ]);

        Livewire::test(EditWorkspace::class, [
            'record' => $workspace->id,
        ])
            ->assertActionHidden('viewStripeDashboard');
    });

    it('can refresh stripe capabilities', function () {
        $workspace = Workspace::factory()->create([
            'stripe_connect_id' => 'acct_test123',
            'stripe_charges_enabled' => false,
            'stripe_payouts_enabled' => false,
        ]);

        $mock = $this->mock(StripeConnectService::class);
        $mock->shouldReceive('updateWorkspaceCapabilities')
            ->once()
            ->with(Mockery::on(fn ($w) => $w->id === $workspace->id))
            ->andReturnUsing(function ($w) {
                $w->update([
                    'stripe_charges_enabled' => true,
                    'stripe_payouts_enabled' => true,
                ]);
            });

        Livewire::test(EditWorkspace::class, [
            'record' => $workspace->id,
        ])
            ->assertActionVisible('refreshCapabilities')
            ->callAction('refreshCapabilities')
            ->assertNotified();

        expect($workspace->refresh())
            ->stripe_charges_enabled->toBeTrue()
            ->stripe_payouts_enabled->toBeTrue();
    });

    it('cannot refresh capabilities for workspace without stripe account', function () {
        $workspace = Workspace::factory()->create([
            'stripe_connect_id' => null,
        ]);

        Livewire::test(EditWorkspace::class, [
            'record' => $workspace->id,
        ])
            ->assertActionHidden('refreshCapabilities');
    });

    it('can delete workspace', function () {
        $workspace = Workspace::factory()->create();

        Livewire::test(EditWorkspace::class, [
            'record' => $workspace->id,
        ])
            ->callAction(DeleteAction::class)
            ->assertNotified();

        expect(Workspace::find($workspace->id))->toBeNull();
    });

    it('shows correct payment status when all conditions met', function () {
        $workspace = Workspace::factory()->create([
            'stripe_connect_id' => 'acct_test123',
            'stripe_charges_enabled' => true,
            'stripe_payouts_enabled' => true,
            'stripe_admin_approved' => true,
        ]);

        expect($workspace->canAcceptPayments())->toBeTrue();
    });

    it('shows inactive payment status without admin approval', function () {
        $workspace = Workspace::factory()->create([
            'stripe_connect_id' => 'acct_test123',
            'stripe_charges_enabled' => true,
            'stripe_payouts_enabled' => true,
            'stripe_admin_approved' => false,
        ]);

        expect($workspace->canAcceptPayments())->toBeFalse();
    });
});

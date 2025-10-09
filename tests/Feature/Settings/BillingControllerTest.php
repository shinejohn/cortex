<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\Workspace;
use App\Services\StripeConnectService;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('BillingController', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
        $this->user->update(['current_workspace_id' => $this->workspace->id]);
        $this->actingAs($this->user);
    });

    describe('show', function () {
        it('shows billing page for authenticated user', function () {
            $response = $this->get(route('settings.workspace.billing'));

            $response->assertSuccessful()
                ->assertInertia(
                    fn ($page) => $page
                        ->component('settings/workspace/billing', false) // Don't check if component exists
                        ->has('workspace')
                        ->where('workspace.id', $this->workspace->id)
                        ->where('workspace.can_accept_payments', false)
                );
        });

        it('shows correct payment status when Stripe is connected', function () {
            $this->workspace->update([
                'stripe_connect_id' => 'acct_test123',
                'stripe_charges_enabled' => true,
                'stripe_payouts_enabled' => true,
                'stripe_admin_approved' => true,
            ]);

            $response = $this->get(route('settings.workspace.billing'));

            $response->assertSuccessful()
                ->assertInertia(
                    fn ($page) => $page
                        ->component('settings/workspace/billing', false) // Don't check if component exists
                        ->where('workspace.stripe_connect_id', 'acct_test123')
                        ->where('workspace.can_accept_payments', true)
                );
        });
    });

    describe('connectStripe', function () {
        it('creates account and returns Stripe onboarding URL', function () {
            // Mock the StripeConnectService
            $mock = $this->mock(StripeConnectService::class);
            $mock->shouldReceive('createOnboardingSession')
                ->once()
                ->with(
                    Mockery::on(fn ($workspace) => $workspace->id === $this->workspace->id),
                    route('settings.workspace.billing.stripe-refresh'),
                    route('settings.workspace.billing.stripe-return')
                )
                ->andReturn('https://connect.stripe.com/setup/test-url');

            $response = $this->withoutMiddleware()->postJson(route('settings.workspace.billing.connect-stripe'));

            $response->assertSuccessful()
                ->assertJson([
                    'url' => 'https://connect.stripe.com/setup/test-url',
                ]);
        });
    });

    describe('stripeReturn', function () {
        it('updates workspace capabilities but requires admin approval', function () {
            $this->workspace->update([
                'stripe_connect_id' => 'acct_test123',
            ]);

            // Mock the service to update capabilities
            $mock = $this->mock(StripeConnectService::class);
            $mock->shouldReceive('handleOnboardingReturn')
                ->once()
                ->with(Mockery::on(fn ($workspace) => $workspace->id === $this->workspace->id))
                ->andReturnUsing(function ($workspace) {
                    $workspace->update([
                        'stripe_charges_enabled' => true,
                        'stripe_payouts_enabled' => true,
                    ]);
                });

            $response = $this->get(route('settings.workspace.billing.stripe-return'));

            $this->workspace->refresh();
            // Should NOT be able to accept payments without admin approval
            expect($this->workspace->canAcceptPayments())->toBeFalse();
            expect($this->workspace->stripe_charges_enabled)->toBeTrue();
            expect($this->workspace->stripe_payouts_enabled)->toBeTrue();
            expect($this->workspace->stripe_admin_approved)->toBeFalse();

            $response->assertRedirect(route('settings.workspace.billing'))
                ->assertSessionHas('info');
        });

        it('allows payments when admin approved', function () {
            $this->workspace->update([
                'stripe_connect_id' => 'acct_test123',
                'stripe_charges_enabled' => true,
                'stripe_payouts_enabled' => true,
                'stripe_admin_approved' => true,
            ]);

            expect($this->workspace->canAcceptPayments())->toBeTrue();
        });
    });

    describe('stripeRefresh', function () {
        it('redirects to Stripe onboarding when refreshing', function () {
            $this->workspace->update([
                'stripe_connect_id' => 'acct_test123',
            ]);

            $mock = $this->mock(StripeConnectService::class);
            $mock->shouldReceive('createOnboardingSession')
                ->once()
                ->andReturn('https://connect.stripe.com/setup/refresh-url');

            $response = $this->get(route('settings.workspace.billing.stripe-refresh'));

            $response->assertRedirect('https://connect.stripe.com/setup/refresh-url');
        });
    });

    describe('stripeDashboard', function () {
        it('returns error when workspace has no Stripe account', function () {
            $response = $this->get(route('settings.workspace.billing.stripe-dashboard'));

            $response->assertStatus(500)
                ->assertJson([
                    'error' => 'Failed to open Stripe dashboard: Workspace does not have a Stripe Connect account',
                ]);
        });

        it('returns Stripe dashboard link when workspace has account', function () {
            $this->workspace->update([
                'stripe_connect_id' => 'acct_test123',
            ]);

            $mock = $this->mock(StripeConnectService::class);
            $mock->shouldReceive('createDashboardLink')
                ->once()
                ->with(Mockery::on(fn ($workspace) => $workspace->id === $this->workspace->id))
                ->andReturn('https://connect.stripe.com/express/acct_test123');

            $response = $this->get(route('settings.workspace.billing.stripe-dashboard'));

            $response->assertSuccessful()
                ->assertJson([
                    'url' => 'https://connect.stripe.com/express/acct_test123',
                ]);
        });
    });
});

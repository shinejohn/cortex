<?php

declare(strict_types=1);

use App\Models\Event;
use App\Models\Product;
use App\Models\Store;
use App\Models\TicketPlan;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembership;
use App\Rules\FreeIfWorkspaceNotApproved;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create a workspace without Stripe approval
    $this->nonApprovedWorkspace = Workspace::factory()->create([
        'owner_id' => $this->user->id,
        'stripe_admin_approved' => false,
        'stripe_connect_id' => null,
        'stripe_charges_enabled' => false,
        'stripe_payouts_enabled' => false,
    ]);

    // Create a workspace with Stripe approval
    $this->approvedWorkspace = Workspace::factory()->create([
        'owner_id' => $this->user->id,
        'stripe_admin_approved' => true,
        'stripe_connect_id' => 'acct_test123',
        'stripe_charges_enabled' => true,
        'stripe_payouts_enabled' => true,
    ]);

    // Add user as member of both workspaces
    WorkspaceMembership::create([
        'workspace_id' => $this->nonApprovedWorkspace->id,
        'user_id' => $this->user->id,
        'role' => 'owner',
    ]);

    WorkspaceMembership::create([
        'workspace_id' => $this->approvedWorkspace->id,
        'user_id' => $this->user->id,
        'role' => 'owner',
    ]);

    $this->user->update(['current_workspace_id' => $this->nonApprovedWorkspace->id]);
});

describe('FreeIfWorkspaceNotApproved Validation Rule', function () {
    it('passes validation when workspace can accept payments and price is set', function () {
        $rule = new FreeIfWorkspaceNotApproved($this->approvedWorkspace);
        $failCalled = false;

        $rule->validate('price', 99.99, function () use (&$failCalled) {
            $failCalled = true;
        });

        expect($failCalled)->toBeFalse();
    });

    it('passes validation when workspace cannot accept payments and price is zero', function () {
        $rule = new FreeIfWorkspaceNotApproved($this->nonApprovedWorkspace);
        $failCalled = false;

        $rule->validate('price', 0, function () use (&$failCalled) {
            $failCalled = true;
        });

        expect($failCalled)->toBeFalse();
    });

    it('fails validation when workspace cannot accept payments and price is non-zero', function () {
        $rule = new FreeIfWorkspaceNotApproved($this->nonApprovedWorkspace);
        $failCalled = false;

        $rule->validate('price', 99.99, function () use (&$failCalled) {
            $failCalled = true;
        });

        expect($failCalled)->toBeTrue();
    });

    it('passes validation for zero string value', function () {
        $rule = new FreeIfWorkspaceNotApproved($this->nonApprovedWorkspace);
        $failCalled = false;

        $rule->validate('price', '0.00', function () use (&$failCalled) {
            $failCalled = true;
        });

        expect($failCalled)->toBeFalse();
    });
});

describe('Product Pricing Restrictions', function () {
    it('prevents non-approved workspace from setting paid product price', function () {
        $store = Store::factory()->create([
            'workspace_id' => $this->nonApprovedWorkspace->id,
            'status' => 'approved',
        ]);

        $response = actingAs($this->user)
            ->postJson(route('products.store', $store->slug), [
                'store_id' => $store->id,
                'name' => 'Test Product',
                'price' => 99.99,
                'quantity' => 10,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);
    });

    it('allows non-approved workspace to set free product price', function () {
        $store = Store::factory()->create([
            'workspace_id' => $this->nonApprovedWorkspace->id,
            'status' => 'approved',
        ]);

        $response = actingAs($this->user)
            ->post(route('products.store', $store->slug), [
                'store_id' => $store->id,
                'name' => 'Free Product',
                'price' => 0,
                'quantity' => 10,
            ]);

        $response->assertRedirect();
        expect(Product::latest()->first()->price)->toBe('0.00');
    });

    it('allows approved workspace to set paid product price', function () {
        $store = Store::factory()->create([
            'workspace_id' => $this->approvedWorkspace->id,
            'status' => 'approved',
        ]);

        $response = actingAs($this->user)
            ->post(route('products.store', $store->slug), [
                'store_id' => $store->id,
                'name' => 'Paid Product',
                'price' => 99.99,
                'quantity' => 10,
            ]);

        $response->assertRedirect();
        expect(Product::latest()->first()->price)->toBe('99.99');
    });
});

describe('Ticket Plan Pricing Restrictions', function () {
    it('prevents non-approved workspace from setting paid ticket plan price', function () {
        $event = Event::factory()->create([
            'workspace_id' => $this->nonApprovedWorkspace->id,
        ]);

        $response = actingAs($this->user)
            ->postJson(route('ticket-plans.store'), [
                'event_id' => $event->id,
                'name' => 'General Admission',
                'description' => 'Standard ticket',
                'price' => 25.00,
                'max_quantity' => 100,
                'available_quantity' => 100,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);
    });

    it('allows non-approved workspace to create free ticket plan', function () {
        $event = Event::factory()->create([
            'workspace_id' => $this->nonApprovedWorkspace->id,
        ]);

        $response = actingAs($this->user)
            ->postJson(route('ticket-plans.store'), [
                'event_id' => $event->id,
                'name' => 'Free Admission',
                'description' => 'Free ticket',
                'price' => 0,
                'max_quantity' => 100,
                'available_quantity' => 100,
            ]);

        $response->assertSuccessful();
        $ticketPlan = TicketPlan::latest()->first();
        expect($ticketPlan->price)->toBe('0.00');
    });

    it('allows approved workspace to set paid ticket plan price', function () {
        $event = Event::factory()->create([
            'workspace_id' => $this->approvedWorkspace->id,
        ]);

        $response = actingAs($this->user)
            ->postJson(route('ticket-plans.store'), [
                'event_id' => $event->id,
                'name' => 'VIP Admission',
                'description' => 'VIP ticket',
                'price' => 100.00,
                'max_quantity' => 50,
                'available_quantity' => 50,
            ]);

        $response->assertSuccessful();
        $ticketPlan = TicketPlan::latest()->first();
        expect($ticketPlan->price)->toBe('100.00');
    });
});

describe('Workspace Payment Capability Check', function () {
    it('correctly identifies non-approved workspace cannot accept payments', function () {
        expect($this->nonApprovedWorkspace->canAcceptPayments())->toBeFalse();
    });

    it('correctly identifies approved workspace can accept payments', function () {
        expect($this->approvedWorkspace->canAcceptPayments())->toBeTrue();
    });

    it('requires all stripe fields to be true for accepting payments', function () {
        $partialWorkspace = Workspace::factory()->create([
            'stripe_admin_approved' => true,
            'stripe_connect_id' => 'acct_test',
            'stripe_charges_enabled' => true,
            'stripe_payouts_enabled' => false, // Missing this
        ]);

        expect($partialWorkspace->canAcceptPayments())->toBeFalse();
    });
});

<?php

declare(strict_types=1);

use App\Models\Store;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembership;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);

    // Create workspace membership for the user
    WorkspaceMembership::factory()->owner()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
    ]);

    $this->store = Store::factory()->create([
        'workspace_id' => $this->workspace->id,
        'status' => 'approved',
    ]);
});

it('displays stripe connect banner when store has not completed onboarding', function () {
    $response = $this->actingAs($this->user)
        ->get(route('stores.show', $this->store->slug));

    $response->assertSuccessful();
    $response->assertInertia(
        fn($page) => $page
            ->component('event-city/stores/show')
            ->has(
                'store',
                fn($store) => $store
                    ->where('is_owner', true)
                    ->where('stripe_connect_id', null)
                    ->where('can_accept_payments', false)
                    ->etc()
            )
    );
});

it('allows owner to access add product page', function () {
    $response = $this->actingAs($this->user)
        ->get(route('products.create', $this->store->id));

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page->component('event-city/products/create'));
});

it('allows owner to access edit store page', function () {
    $response = $this->actingAs($this->user)
        ->get(route('stores.edit', $this->store->id));

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page->component('event-city/stores/edit'));
});

it('prevents non-owner from accessing edit store page', function () {
    $otherUser = User::factory()->create();
    $otherWorkspace = Workspace::factory()->create(['owner_id' => $otherUser->id]);
    $otherUser->update(['current_workspace_id' => $otherWorkspace->id]);

    WorkspaceMembership::factory()->owner()->create([
        'workspace_id' => $otherWorkspace->id,
        'user_id' => $otherUser->id,
    ]);

    $response = $this->actingAs($otherUser)
        ->get(route('stores.edit', $this->store->id));

    $response->assertForbidden();
});

it('prevents non-owner from accessing add product page', function () {
    $otherUser = User::factory()->create();
    $otherWorkspace = Workspace::factory()->create(['owner_id' => $otherUser->id]);
    $otherUser->update(['current_workspace_id' => $otherWorkspace->id]);

    WorkspaceMembership::factory()->owner()->create([
        'workspace_id' => $otherWorkspace->id,
        'user_id' => $otherUser->id,
    ]);

    $response = $this->actingAs($otherUser)
        ->get(route('products.create', $this->store->id));

    $response->assertForbidden();
});

it('redirects to stripe connect onboarding when initiated', function () {
    // Verify the route is accessible with correct ID parameter
    $response = $this->actingAs($this->user)
        ->post(route('stores.connect-stripe', $this->store->id));

    // Will fail without Stripe keys configured but validates route and auth work
    // Expected to either redirect to Stripe or show error about missing keys
    expect($response->status())->toBeIn([302, 500]);
})->skip('Requires Stripe API configuration');

it('shows stripe dashboard link for stores with stripe connect', function () {
    $this->workspace->update([
        'stripe_connect_id' => 'acct_test123',
        'stripe_charges_enabled' => true,
        'stripe_payouts_enabled' => true,
        'stripe_admin_approved' => true,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('stores.show', $this->store->slug));

    $response->assertSuccessful();
    $response->assertInertia(
        fn($page) => $page
            ->has(
                'store',
                fn($store) => $store
                    ->where('is_owner', true)
                    ->where('stripe_connect_id', 'acct_test123')
                    ->where('can_accept_payments', true)
                    ->etc()
            )
    );
});

it('does not expose stripe info to non-owners', function () {
    $this->workspace->update([
        'stripe_connect_id' => 'acct_test123',
        'stripe_charges_enabled' => true,
        'stripe_payouts_enabled' => true,
    ]);

    $otherUser = User::factory()->create();

    $response = $this->actingAs($otherUser)
        ->get(route('stores.show', $this->store->slug));

    $response->assertSuccessful();
    $response->assertInertia(
        fn($page) => $page
            ->has(
                'store',
                fn($store) => $store
                    ->where('is_owner', false)
                    ->where('stripe_connect_id', null)
                    ->where('can_accept_payments', null)
                    ->etc()
            )
    );
});

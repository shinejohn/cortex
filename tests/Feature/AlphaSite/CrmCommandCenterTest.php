<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\Industry;
use App\Models\User;

beforeEach(function () {
    config(['domains.alphasite' => 'alphasite.test']);
});

test('command center requires authentication', function () {
    $response = $this->get('http://alphasite.test/crm/command-center');

    $response->assertRedirect();
});

test('command center returns 404 when user has no claimed business', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get('http://alphasite.test/crm/command-center');

    $response->assertNotFound();
});

test('command center loads for user with claimed business', function () {
    $user = User::factory()->create();
    $industry = Industry::factory()->create();
    $business = Business::factory()->create([
        'industry_id' => $industry->id,
        'claimed_by_id' => $user->id,
        'status' => 'active',
    ]);

    App\Models\BusinessSubscription::factory()->create([
        'business_id' => $business->id,
        'tier' => 'standard',
    ]);

    $response = $this->actingAs($user)->get('http://alphasite.test/crm/command-center');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('alphasite/crm/command-center')
        ->has('business')
        ->has('commandCenter')
        ->has('commandCenter.metrics')
        ->has('commandCenter.alerts')
        ->has('commandCenter.activity')
        ->has('commandCenter.quick_actions')
    );
});

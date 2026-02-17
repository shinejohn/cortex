<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\Industry;

beforeEach(function () {
    config(['domains.alphasite' => 'alphasite.test']);
});

test('alphasite home loads successfully', function () {
    $response = $this->get('http://alphasite.test/');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('alphasite/directory/home')
        ->has('featuredBusinesses')
        ->has('featuredCommunities')
        ->has('stats')
    );
});

test('directory index loads successfully', function () {
    $response = $this->get('http://alphasite.test/directory');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('alphasite/directory/index')
        ->has('businesses')
        ->has('filters')
    );
});

test('directory by location loads with city and state', function () {
    $industry = Industry::factory()->create();
    Business::factory()->create([
        'industry_id' => $industry->id,
        'city' => 'tampa',
        'state' => 'FL',
        'status' => 'active',
    ]);

    $response = $this->get('http://alphasite.test/directory/tampa-fl');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('alphasite/directory/location')
        ->has('businesses')
        ->where('city', 'tampa')
        ->where('state', 'fl')
    );
});

test('get started page loads', function () {
    $response = $this->get('http://alphasite.test/get-started');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('alphasite/get-started'));
});

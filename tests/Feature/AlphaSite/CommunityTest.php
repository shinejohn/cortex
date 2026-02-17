<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\Industry;

beforeEach(function () {
    config(['domains.alphasite' => 'alphasite.test']);
});

test('community page loads for city-state', function () {
    $industry = Industry::factory()->create();
    Business::factory()->create([
        'industry_id' => $industry->id,
        'city' => 'Tampa',
        'state' => 'FL',
        'status' => 'active',
    ]);

    $response = $this->get('http://alphasite.test/community/tampa-fl');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('alphasite/community/show')
        ->has('community')
        ->has('businesses')
        ->has('categories')
    );
});

test('community downtown page loads', function () {
    $response = $this->get('http://alphasite.test/community/miami-fl/downtown');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('alphasite/community/show'));
});

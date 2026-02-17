<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\BusinessSubscription;
use App\Models\BusinessTemplate;
use App\Models\Industry;

beforeEach(function () {
    config(['domains.alphasite' => 'alphasite.test']);
});

test('business page returns 404 for non-existent slug', function () {
    $response = $this->get('http://alphasite.test/business/non-existent-slug-12345');

    $response->assertNotFound();
});

test('business page loads for existing business by slug', function () {
    $industry = Industry::factory()->create();
    $business = Business::factory()->create([
        'industry_id' => $industry->id,
        'status' => 'active',
    ]);

    BusinessTemplate::factory()->create(['slug' => 'generic']);

    $response = $this->get("http://alphasite.test/business/{$business->slug}");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('alphasite/business/show')
        ->has('business')
        ->where('business.id', $business->id)
        ->has('seo')
        ->has('tabs')
    );
});

test('business page loads by subdomain when alphasite_subdomain is set', function () {
    $industry = Industry::factory()->create();
    $business = Business::factory()->create([
        'industry_id' => $industry->id,
        'alphasite_subdomain' => 'acme',
        'status' => 'active',
    ]);

    BusinessTemplate::factory()->create(['slug' => 'generic']);

    $response = $this->get('http://acme.alphasite.com/');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('alphasite/business/show')
        ->has('business')
        ->where('business.id', $business->id)
    );
});

test('business tabs load correctly', function () {
    $industry = Industry::factory()->create();
    $business = Business::factory()->create([
        'industry_id' => $industry->id,
        'status' => 'active',
    ]);

    BusinessTemplate::factory()->create(['slug' => 'generic']);

    $response = $this->get("http://alphasite.test/business/{$business->slug}/reviews");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('alphasite/business/show')
        ->where('activeTab', 'reviews')
    );
});

test('ai chat returns 404 for non-existent business', function () {
    $response = $this->postJson('http://alphasite.test/business/non-existent/ai/chat', [
        'message' => 'Hello',
    ]);

    $response->assertNotFound();
});

test('ai chat returns 403 when business has no concierge', function () {
    $industry = Industry::factory()->create();
    $business = Business::factory()->create([
        'industry_id' => $industry->id,
        'status' => 'active',
    ]);

    BusinessSubscription::factory()->create([
        'business_id' => $business->id,
        'tier' => 'basic',
        'ai_services_enabled' => [],
    ]);

    $response = $this->postJson("http://alphasite.test/business/{$business->slug}/ai/chat", [
        'message' => 'What are your hours?',
    ]);

    $response->assertForbidden();
    $response->assertJson(['success' => false]);
});

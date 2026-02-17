<?php

declare(strict_types=1);

use App\Models\Performer;
use App\Models\QrFlyer;
use App\Models\Workspace;

use function Pest\Laravel\postJson;

beforeEach(function () {
    $this->workspace = Workspace::factory()->create();

    $this->performer = Performer::factory()->create([
        'workspace_id' => $this->workspace->id,
        'tips_enabled' => true,
        'landing_page_slug' => 'the-sunset-vibes',
        'landing_page_published' => true,
    ]);
});

it('shows the performer landing page for a published performer', function () {
    $response = $this->get("/p/{$this->performer->landing_page_slug}");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('event-city/performers/landing')
        ->has('performer')
        ->where('performer.id', $this->performer->id)
        ->where('performer.name', $this->performer->name)
        ->where('performer.landing_page_slug', 'the-sunset-vibes')
    );
});

it('returns 404 for an unpublished performer landing page', function () {
    $unpublishedPerformer = Performer::factory()->create([
        'workspace_id' => $this->workspace->id,
        'tips_enabled' => true,
        'landing_page_slug' => 'hidden-band',
        'landing_page_published' => false,
    ]);

    $response = $this->get("/p/{$unpublishedPerformer->landing_page_slug}");

    $response->assertNotFound();
});

it('records a QR flyer scan and increments the count', function () {
    $flyer = QrFlyer::factory()->create([
        'performer_id' => $this->performer->id,
        'scan_count' => 10,
        'is_active' => true,
    ]);

    $response = postJson("/p/{$this->performer->landing_page_slug}/scan");

    $response->assertSuccessful();
    $response->assertJson(['success' => true]);

    $flyer->refresh();
    expect($flyer->scan_count)->toBe(11);
});

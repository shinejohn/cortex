<?php

declare(strict_types=1);

use App\Models\Performer;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->workspace = Workspace::factory()->withStripe()->create([
        'owner_id' => $this->user->id,
    ]);

    $this->user->update(['current_workspace_id' => $this->workspace->id]);

    $this->performer = Performer::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->user->id,
        'tips_enabled' => true,
        'landing_page_slug' => 'dashboard-band',
        'landing_page_published' => true,
        'total_tips_received_cents' => 0,
        'total_tip_count' => 0,
        'total_fans_captured' => 0,
    ]);
});

it('shows the tip jar dashboard for an authenticated performer', function () {
    $response = $this->actingAs($this->user)->get('/dashboard/tip-jar');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('event-city/dashboard/tip-jar')
        ->has('performer')
        ->has('stats')
        ->has('recentTips')
        ->has('funnelMetrics')
    );
});

it('prevents unauthenticated access to the tip dashboard', function () {
    $response = $this->get('/dashboard/tip-jar');

    $response->assertRedirect();
    expect($response->status())->toBeIn([302, 401]);
});

it('generates a QR flyer from the dashboard', function () {
    Storage::fake('public');

    Http::fake([
        'api.qrserver.com/*' => Http::response('fake-png-content', 200),
    ]);

    $response = $this->actingAs($this->user)->postJson('/dashboard/tip-jar/qr-flyers', [
        'title' => 'Support Us Tonight!',
        'subtitle' => 'Scan the code to tip',
        'template' => 'neon',
    ]);

    $response->assertSuccessful();
    $response->assertJson(['success' => true]);
    $response->assertJsonStructure(['success', 'flyer']);

    $this->assertDatabaseHas('qr_flyers', [
        'performer_id' => $this->performer->id,
        'title' => 'Support Us Tonight!',
        'template' => 'neon',
        'is_active' => true,
    ]);
});

<?php

declare(strict_types=1);

use App\Models\Performer;
use App\Models\QrFlyer;
use App\Models\Workspace;
use App\Services\EventCity\QrFlyerService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->workspace = Workspace::factory()->create();

    $this->performer = Performer::factory()->create([
        'workspace_id' => $this->workspace->id,
        'tips_enabled' => true,
        'landing_page_slug' => 'test-band',
        'landing_page_published' => true,
    ]);

    $this->service = app(QrFlyerService::class);
});

it('generates a QR flyer with correct data', function () {
    Storage::fake('public');

    Http::fake([
        'api.qrserver.com/*' => Http::response('fake-png-content', 200),
    ]);

    $flyer = $this->service->generateFlyer($this->performer, [
        'title' => 'Tip Me Live!',
        'subtitle' => 'Scan to support the band',
        'template' => 'modern',
    ]);

    expect($flyer)->toBeInstanceOf(QrFlyer::class);
    expect($flyer->performer_id)->toBe($this->performer->id);
    expect($flyer->title)->toBe('Tip Me Live!');
    expect($flyer->subtitle)->toBe('Scan to support the band');
    expect($flyer->template)->toBe('modern');
    expect($flyer->is_active)->toBeTrue();
    expect($flyer->qr_code_data)->toContain('/p/test-band');

    $this->assertDatabaseHas('qr_flyers', [
        'id' => $flyer->id,
        'performer_id' => $this->performer->id,
        'title' => 'Tip Me Live!',
        'template' => 'modern',
        'is_active' => true,
    ]);

    Http::assertSentCount(1);
});

it('increments scan count when tracking a scan', function () {
    $flyer = QrFlyer::factory()->create([
        'performer_id' => $this->performer->id,
        'scan_count' => 5,
    ]);

    $this->service->trackScan($flyer);

    $flyer->refresh();
    expect($flyer->scan_count)->toBe(6);

    $this->service->trackScan($flyer);

    $flyer->refresh();
    expect($flyer->scan_count)->toBe(7);
});

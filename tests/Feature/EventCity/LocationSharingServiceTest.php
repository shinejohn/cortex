<?php

declare(strict_types=1);

use App\Events\EventCity\LocationShareStarted;
use App\Models\Event;
use App\Models\LocationShare;
use App\Models\User;
use App\Services\EventCity\LocationSharingService;
use Illuminate\Support\Facades\Event as EventFacade;

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
    EventFacade::fake();
});

it('starts location sharing for a user', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create();
    $service = app(LocationSharingService::class);

    $share = $service->startSharing(
        $user,
        27.9506,
        -82.4572,
        $event->id,
    );

    expect($share)->toBeInstanceOf(LocationShare::class);
    expect($share->user_id)->toBe($user->id);
    expect($share->event_id)->toBe($event->id);
    expect((float) $share->latitude)->toEqualWithDelta(27.9506, 0.001);
    expect((float) $share->longitude)->toEqualWithDelta(-82.4572, 0.001);
    expect($share->expires_at)->not->toBeNull();
    expect($share->stopped_at)->toBeNull();

    $this->assertDatabaseHas('location_shares', [
        'user_id' => $user->id,
        'event_id' => $event->id,
    ]);

    EventFacade::assertDispatched(LocationShareStarted::class);
});

it('updates location coordinates on an active share', function () {
    $user = User::factory()->create();
    $share = LocationShare::factory()->create([
        'user_id' => $user->id,
        'latitude' => 27.9506,
        'longitude' => -82.4572,
    ]);

    $service = app(LocationSharingService::class);
    $updatedShare = $service->updateLocation($share, 28.0394, -82.4603, 15.5);

    expect((float) $updatedShare->latitude)->toEqualWithDelta(28.0394, 0.001);
    expect((float) $updatedShare->longitude)->toEqualWithDelta(-82.4603, 0.001);
    expect((float) $updatedShare->accuracy_meters)->toEqualWithDelta(15.5, 0.01);

    $this->assertDatabaseHas('location_shares', [
        'id' => $share->id,
    ]);
});

it('stops location sharing', function () {
    $user = User::factory()->create();
    $share = LocationShare::factory()->create([
        'user_id' => $user->id,
        'stopped_at' => null,
    ]);

    $service = app(LocationSharingService::class);
    $stoppedShare = $service->stopSharing($share);

    expect($stoppedShare->stopped_at)->not->toBeNull();

    $this->assertDatabaseMissing('location_shares', [
        'id' => $share->id,
        'stopped_at' => null,
    ]);
});

it('cleans up expired location shares', function () {
    $user = User::factory()->create();

    // Create expired shares (not yet stopped)
    LocationShare::factory()->expired()->count(3)->create([
        'user_id' => $user->id,
        'stopped_at' => null,
    ]);

    // Create an active share that should NOT be cleaned up
    LocationShare::factory()->create([
        'user_id' => $user->id,
        'expires_at' => now()->addHours(1),
        'stopped_at' => null,
    ]);

    $service = app(LocationSharingService::class);
    $cleanedUp = $service->cleanupExpiredShares();

    expect($cleanedUp)->toBe(3);

    $activeShares = LocationShare::where('user_id', $user->id)
        ->whereNull('stopped_at')
        ->count();

    expect($activeShares)->toBe(1);
});

<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\UserBehavioralEvent;
use App\Services\EventCity\BehavioralTrackingService;
use Illuminate\Support\Facades\Event;

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
    Event::fake();
});

it('records a behavioral event for an authenticated user', function () {
    $user = User::factory()->create();
    $service = app(BehavioralTrackingService::class);

    $event = $service->recordEvent(
        $user,
        'event_view',
        'event',
        'some-content-id',
        'music',
        ['referrer' => 'homepage'],
    );

    expect($event)->toBeInstanceOf(UserBehavioralEvent::class);
    expect($event->event_type)->toBe('event_view');
    expect($event->user_id)->toBe($user->id);
    expect($event->content_type)->toBe('event');
    expect($event->content_id)->toBe('some-content-id');
    expect($event->category)->toBe('music');
    expect($event->context)->toBe(['referrer' => 'homepage']);
    expect($event->occurred_at)->not->toBeNull();

    $this->assertDatabaseHas('user_behavioral_events', [
        'user_id' => $user->id,
        'event_type' => 'event_view',
        'content_type' => 'event',
        'category' => 'music',
    ]);
});

it('records an anonymous behavioral event with session id', function () {
    $service = app(BehavioralTrackingService::class);
    $sessionId = 'anonymous-session-abc123';

    $event = $service->recordAnonymousEvent(
        $sessionId,
        'page_view',
        ['content_type' => 'venue', 'content_id' => 'venue-uuid', 'category' => 'nightlife'],
    );

    expect($event)->toBeInstanceOf(UserBehavioralEvent::class);
    expect($event->user_id)->toBeNull();
    expect($event->session_id)->toBe($sessionId);
    expect($event->event_type)->toBe('page_view');
    expect($event->content_type)->toBe('venue');
    expect($event->content_id)->toBe('venue-uuid');
    expect($event->category)->toBe('nightlife');

    $this->assertDatabaseHas('user_behavioral_events', [
        'session_id' => $sessionId,
        'event_type' => 'page_view',
        'user_id' => null,
    ]);
});

it('retrieves recent behavior for a user within timeframe', function () {
    $user = User::factory()->create();

    UserBehavioralEvent::factory()->count(3)->create([
        'user_id' => $user->id,
        'occurred_at' => now()->subDays(5),
    ]);

    UserBehavioralEvent::factory()->count(2)->create([
        'user_id' => $user->id,
        'occurred_at' => now()->subDays(40),
    ]);

    $service = app(BehavioralTrackingService::class);

    $recentEvents = $service->getRecentBehavior($user, 30);

    expect($recentEvents)->toHaveCount(3);
    $recentEvents->each(function (UserBehavioralEvent $event) use ($user) {
        expect($event->user_id)->toBe($user->id);
    });
});

it('assigns correct device type from user agent', function () {
    $user = User::factory()->create();
    $service = app(BehavioralTrackingService::class);

    // Test mobile user agent - set directly on the request object
    request()->headers->set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)');
    $mobileEvent = $service->recordEvent($user, 'page_view');
    expect($mobileEvent->device_type)->toBe('mobile');

    // Test tablet user agent
    request()->headers->set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)');
    $tabletEvent = $service->recordEvent($user, 'page_view');
    expect($tabletEvent->device_type)->toBe('tablet');

    // Test desktop user agent
    request()->headers->set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    $desktopEvent = $service->recordEvent($user, 'page_view');
    expect($desktopEvent->device_type)->toBe('desktop');
});

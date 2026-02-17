<?php

declare(strict_types=1);

use App\Events\EventCity\SequenceStepTriggered;
use App\Models\Event;
use App\Models\SequenceEnrollment;
use App\Models\User;
use App\Services\EventCity\EngagementSequenceService;
use Illuminate\Support\Facades\Event as EventFacade;

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
});

it('enrolls a user in an engagement sequence', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create();
    $service = app(EngagementSequenceService::class);

    $enrollment = $service->enrollUser($user, 'event_view', $event);

    expect($enrollment)->toBeInstanceOf(SequenceEnrollment::class);
    expect($enrollment->user_id)->toBe($user->id);
    expect($enrollment->event_id)->toBe($event->id);
    expect($enrollment->trigger_type)->toBe('event_view');
    expect($enrollment->current_step)->toBe(0);
    expect($enrollment->status)->toBe('active');
    expect($enrollment->next_step_at)->not->toBeNull();
    expect($enrollment->step_history)->toBe([]);

    $this->assertDatabaseHas('sequence_enrollments', [
        'user_id' => $user->id,
        'event_id' => $event->id,
        'trigger_type' => 'event_view',
        'status' => 'active',
    ]);
});

it('processes the next step in a sequence', function () {
    EventFacade::fake([SequenceStepTriggered::class]);

    $user = User::factory()->create();
    $enrollment = SequenceEnrollment::factory()->active()->create([
        'user_id' => $user->id,
        'trigger_type' => 'event_view',
        'current_step' => 0,
        'next_step_at' => now()->subMinute(),
        'step_history' => [],
    ]);

    $service = app(EngagementSequenceService::class);
    $processed = $service->processNextSteps();

    expect($processed)->toBe(1);

    $enrollment->refresh();
    expect($enrollment->current_step)->toBeGreaterThan(0);

    EventFacade::assertDispatched(SequenceStepTriggered::class);
});

it('completes a sequence when all steps are done', function () {
    EventFacade::fake([SequenceStepTriggered::class]);

    $user = User::factory()->create();

    // search trigger has max 2 steps, so step 2 should complete it
    $enrollment = SequenceEnrollment::factory()->active()->create([
        'user_id' => $user->id,
        'trigger_type' => 'search',
        'current_step' => 1,
        'next_step_at' => now()->subMinute(),
        'step_history' => [
            ['step' => 0, 'completed_at' => now()->subHours(24)->toISOString()],
        ],
    ]);

    $service = app(EngagementSequenceService::class);
    $service->executeStep($enrollment);

    $enrollment->refresh();
    expect($enrollment->status)->toBe('completed');
    expect($enrollment->completed_at)->not->toBeNull();
    expect($enrollment->next_step_at)->toBeNull();
});

it('pauses a sequence', function () {
    $user = User::factory()->create();
    $enrollment = SequenceEnrollment::factory()->active()->create([
        'user_id' => $user->id,
        'current_step' => 1,
    ]);

    $enrollment->pause();
    $enrollment->refresh();

    expect($enrollment->status)->toBe('paused');
    expect($enrollment->next_step_at)->toBeNull();

    $this->assertDatabaseHas('sequence_enrollments', [
        'id' => $enrollment->id,
        'status' => 'paused',
    ]);
});

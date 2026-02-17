<?php

declare(strict_types=1);

use App\Events\EventCity\AchievementUnlocked;
use App\Models\User;
use App\Models\UserAchievementProgress;
use App\Services\EventCity\AchievementBridgeService;
use Illuminate\Support\Facades\Event;

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
});

it('increments achievement progress for a user', function () {
    $user = User::factory()->create();
    $service = app(AchievementBridgeService::class);

    Event::fake();

    $progress = $service->checkAndProgress($user, 'event_explorer_5', 1);

    expect($progress)->toBeInstanceOf(UserAchievementProgress::class);
    expect($progress->user_id)->toBe($user->id);
    expect($progress->achievement_slug)->toBe('event_explorer_5');
    expect($progress->category)->toBe('explorer');
    expect($progress->current_progress)->toBe(1);
    expect($progress->target_value)->toBe(5);
    expect($progress->completed_at)->toBeNull();

    $this->assertDatabaseHas('user_achievement_progress', [
        'user_id' => $user->id,
        'achievement_slug' => 'event_explorer_5',
        'current_progress' => 1,
    ]);
});

it('completes an achievement when target is reached', function () {
    Event::fake([AchievementUnlocked::class]);

    $user = User::factory()->create();
    $service = app(AchievementBridgeService::class);

    // Progress to 0 out of 1 (first_event has target=1)
    UserAchievementProgress::factory()->create([
        'user_id' => $user->id,
        'achievement_slug' => 'first_event',
        'category' => 'explorer',
        'current_progress' => 0,
        'target_value' => 1,
        'completed_at' => null,
        'points_awarded' => 0,
    ]);

    $progress = $service->checkAndProgress($user, 'first_event', 1);

    expect($progress->current_progress)->toBe(1);
    expect($progress->completed_at)->not->toBeNull();

    Event::assertDispatched(AchievementUnlocked::class, function (AchievementUnlocked $event) use ($progress) {
        return $event->achievement->id === $progress->id;
    });
});

it('awards points when achievement is completed', function () {
    Event::fake([AchievementUnlocked::class]);

    $user = User::factory()->create();
    $service = app(AchievementBridgeService::class);

    UserAchievementProgress::factory()->create([
        'user_id' => $user->id,
        'achievement_slug' => 'first_event',
        'category' => 'explorer',
        'current_progress' => 0,
        'target_value' => 1,
        'completed_at' => null,
        'points_awarded' => 0,
    ]);

    $progress = $service->checkAndProgress($user, 'first_event', 1);

    expect($progress->points_awarded)->toBe(10);

    $this->assertDatabaseHas('user_achievement_progress', [
        'user_id' => $user->id,
        'achievement_slug' => 'first_event',
        'points_awarded' => 10,
    ]);
});

it('returns all achievement definitions', function () {
    $service = app(AchievementBridgeService::class);
    $definitions = $service->getAchievementDefinitions();

    expect($definitions)->toBeArray();
    expect($definitions)->not->toBeEmpty();

    $firstDefinition = $definitions[0];
    expect($firstDefinition)->toHaveKeys(['slug', 'name', 'description', 'category', 'target', 'points']);
    expect($firstDefinition['slug'])->toBe('first_event');
    expect($firstDefinition['category'])->toBe('explorer');
    expect($firstDefinition['target'])->toBe(1);
    expect($firstDefinition['points'])->toBe(10);
});

it('returns user achievements with progress', function () {
    $user = User::factory()->create();

    UserAchievementProgress::factory()->create([
        'user_id' => $user->id,
        'achievement_slug' => 'first_event',
        'category' => 'explorer',
        'current_progress' => 1,
        'target_value' => 1,
        'completed_at' => now(),
        'points_awarded' => 10,
    ]);

    UserAchievementProgress::factory()->create([
        'user_id' => $user->id,
        'achievement_slug' => 'event_explorer_5',
        'category' => 'explorer',
        'current_progress' => 3,
        'target_value' => 5,
        'completed_at' => null,
        'points_awarded' => 0,
    ]);

    $service = app(AchievementBridgeService::class);
    $achievements = $service->getUserAchievements($user);

    expect($achievements)->toHaveCount(2);
    expect($achievements->first()->user_id)->toBe($user->id);

    $completed = $achievements->firstWhere('achievement_slug', 'first_event');
    expect($completed->completed_at)->not->toBeNull();
    expect($completed->points_awarded)->toBe(10);

    $inProgress = $achievements->firstWhere('achievement_slug', 'event_explorer_5');
    expect($inProgress->completed_at)->toBeNull();
    expect($inProgress->current_progress)->toBe(3);
});

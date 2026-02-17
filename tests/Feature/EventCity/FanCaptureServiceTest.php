<?php

declare(strict_types=1);

use App\Events\EventCity\FanCaptured;
use App\Events\EventCity\FanConvertedToUser;
use App\Models\Fan;
use App\Models\Performer;
use App\Models\User;
use App\Models\Workspace;
use App\Services\EventCity\FanCaptureService;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->workspace = Workspace::factory()->create();

    $this->performer = Performer::factory()->create([
        'workspace_id' => $this->workspace->id,
        'tips_enabled' => true,
        'total_fans_captured' => 0,
    ]);

    $this->service = app(FanCaptureService::class);
});

it('captures a new fan for a performer', function () {
    Event::fake([FanCaptured::class]);

    $fan = $this->service->captureOrFindFan($this->performer, [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '555-123-4567',
        'source' => 'landing_page',
    ]);

    expect($fan)->toBeInstanceOf(Fan::class);
    expect($fan->name)->toBe('Jane Doe');
    expect($fan->email)->toBe('jane@example.com');
    expect($fan->phone)->toBe('555-123-4567');
    expect($fan->source)->toBe('landing_page');
    expect($fan->performer_id)->toBe($this->performer->id);

    $this->assertDatabaseHas('fans', [
        'performer_id' => $this->performer->id,
        'email' => 'jane@example.com',
        'name' => 'Jane Doe',
    ]);

    $this->performer->refresh();
    expect($this->performer->total_fans_captured)->toBe(1);

    Event::assertDispatched(FanCaptured::class, function (FanCaptured $event) use ($fan) {
        return $event->fan->id === $fan->id;
    });
});

it('deduplicates fans by email for the same performer', function () {
    Event::fake([FanCaptured::class]);

    $firstFan = $this->service->captureOrFindFan($this->performer, [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'source' => 'landing_page',
    ]);

    $secondFan = $this->service->captureOrFindFan($this->performer, [
        'name' => 'Jane Doe Updated',
        'email' => 'jane@example.com',
        'source' => 'qr_code',
    ]);

    expect($secondFan->id)->toBe($firstFan->id);

    $fanCount = Fan::where('performer_id', $this->performer->id)
        ->where('email', 'jane@example.com')
        ->count();

    expect($fanCount)->toBe(1);

    $this->performer->refresh();
    expect($this->performer->total_fans_captured)->toBe(1);

    Event::assertDispatchedTimes(FanCaptured::class, 1);
});

it('converts a fan to a user account', function () {
    Event::fake([FanConvertedToUser::class]);

    $fan = Fan::factory()->create([
        'performer_id' => $this->performer->id,
        'user_id' => null,
        'converted_to_user_at' => null,
    ]);

    $user = User::factory()->create();

    $convertedFan = $this->service->convertFanToUser($fan, $user);

    expect($convertedFan->user_id)->toBe($user->id);
    expect($convertedFan->converted_to_user_at)->not->toBeNull();
    expect($convertedFan->isConverted())->toBeTrue();

    $this->assertDatabaseHas('fans', [
        'id' => $fan->id,
        'user_id' => $user->id,
    ]);

    Event::assertDispatched(FanConvertedToUser::class, function (FanConvertedToUser $event) use ($fan) {
        return $event->fan->id === $fan->id;
    });
});

it('exports fans as CSV with correct headers and data', function () {
    Fan::factory()->count(3)->create([
        'performer_id' => $this->performer->id,
        'tip_count' => 2,
        'total_tips_given_cents' => 5000,
    ]);

    $csv = $this->service->exportFansCsv($this->performer);

    $lines = explode("\n", mb_trim($csv));

    expect($lines[0])->toBe('Name,Email,Phone,Source,Tips,Total Given,First Seen,Converted');
    expect(count($lines))->toBe(4); // 1 header + 3 data rows

    $firstDataLine = str_getcsv($lines[1]);
    expect($firstDataLine)->toHaveCount(8);
    expect($firstDataLine[4])->toBe('2');
    expect($firstDataLine[5])->toBe('50.00');
    expect($firstDataLine[7])->toBe('No');
});

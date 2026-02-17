<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\Region;
use App\Services\Newsroom\PollSolicitationService;
use Illuminate\Support\Facades\Mail;

it('can be instantiated', function () {
    $service = app(PollSolicitationService::class);
    expect($service)->toBeInstanceOf(PollSolicitationService::class);
});

it('solicitForPoll skips options without valid business email', function () {
    Mail::fake();

    $region = Region::factory()->active()->create();
    $poll = Poll::create([
        'region_id' => $region->id,
        'title' => 'Best Pizza',
        'slug' => 'best-pizza-'.uniqid(),
        'description' => 'Vote for best pizza',
        'poll_type' => 'weekly_smb_promotional',
        'voting_starts_at' => now(),
        'voting_ends_at' => now()->addDays(7),
        'is_active' => true,
    ]);

    $businessNoEmail = Business::factory()->create(['email' => null]);
    PollOption::create([
        'poll_id' => $poll->id,
        'business_id' => $businessNoEmail->id,
        'name' => $businessNoEmail->name,
        'display_order' => 0,
    ]);

    $service = app(PollSolicitationService::class);
    $stats = $service->solicitForPoll($poll);

    expect($stats['sent'])->toBe(0);
    expect($stats['skipped'])->toBe(1);
});

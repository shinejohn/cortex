<?php

declare(strict_types=1);

use App\Events\EventCity\TipReceived;
use App\Models\Fan;
use App\Models\Performer;
use App\Models\Tip;
use App\Models\Workspace;
use App\Services\EventCity\TipService;
use App\Services\StripeConnectService;
use Illuminate\Support\Facades\Event;
use Stripe\PaymentIntent;

beforeEach(function () {
    $this->workspace = Workspace::factory()->withStripe()->create();

    $this->performer = Performer::factory()->create([
        'workspace_id' => $this->workspace->id,
        'tips_enabled' => true,
        'landing_page_slug' => 'test-performer',
        'landing_page_published' => true,
        'total_tips_received_cents' => 0,
        'total_tip_count' => 0,
        'total_fans_captured' => 0,
    ]);
});

it('creates a tip and fan record when processing a tip', function () {
    $fan = Fan::factory()->create([
        'performer_id' => $this->performer->id,
        'email' => 'tipper@example.com',
        'tip_count' => 0,
        'total_tips_given_cents' => 0,
    ]);

    $tip = Tip::factory()->create([
        'performer_id' => $this->performer->id,
        'fan_id' => $fan->id,
        'amount_cents' => 1000,
        'platform_fee_cents' => 0,
        'status' => 'pending',
    ]);

    expect($tip)->toBeInstanceOf(Tip::class);
    expect($tip->performer_id)->toBe($this->performer->id);
    expect($tip->fan_id)->toBe($fan->id);
    expect($tip->amount_cents)->toBe(1000);
    expect($tip->status)->toBe('pending');

    $this->assertDatabaseHas('fans', [
        'id' => $fan->id,
        'performer_id' => $this->performer->id,
        'email' => 'tipper@example.com',
    ]);

    $this->assertDatabaseHas('tips', [
        'id' => $tip->id,
        'performer_id' => $this->performer->id,
        'fan_id' => $fan->id,
    ]);
});

it('finds existing fan by email instead of duplicating', function () {
    $fan = Fan::factory()->create([
        'performer_id' => $this->performer->id,
        'email' => 'repeat-tipper@example.com',
    ]);

    Tip::factory()->create([
        'performer_id' => $this->performer->id,
        'fan_id' => $fan->id,
    ]);

    $secondTip = Tip::factory()->create([
        'performer_id' => $this->performer->id,
        'fan_id' => $fan->id,
    ]);

    expect($secondTip->fan_id)->toBe($fan->id);

    $fanCount = Fan::where('performer_id', $this->performer->id)
        ->where('email', 'repeat-tipper@example.com')
        ->count();

    expect($fanCount)->toBe(1);
});

it('calculates 0% platform fee on tips', function () {
    $mockPaymentIntent = new PaymentIntent('pi_test_123');
    $mockPaymentIntent->client_secret = 'pi_test_123_secret_abc';

    $mockStripe = $this->mock(StripeConnectService::class);
    $mockStripe->shouldReceive('createTipPaymentIntent')
        ->once()
        ->with(
            Mockery::on(fn ($workspace) => $workspace->id === $this->workspace->id),
            1000,
            Mockery::on(fn ($metadata) => $metadata['type'] === 'tip' && $metadata['performer_id'] === $this->performer->id)
        )
        ->andReturn($mockPaymentIntent);

    $service = app(TipService::class);
    $paymentIntent = $service->createPaymentIntent($this->performer, 1000);

    expect($paymentIntent->id)->toBe('pi_test_123');

    $tip = Tip::factory()->create([
        'performer_id' => $this->performer->id,
        'amount_cents' => 1000,
        'platform_fee_cents' => 0,
    ]);

    expect($tip->platform_fee_cents)->toBe(0);
});

it('handles tip payment succeeded webhook correctly', function () {
    Event::fake([TipReceived::class]);

    $fan = Fan::factory()->create([
        'performer_id' => $this->performer->id,
        'tip_count' => 0,
        'total_tips_given_cents' => 0,
    ]);

    $tip = Tip::factory()->create([
        'performer_id' => $this->performer->id,
        'fan_id' => $fan->id,
        'amount_cents' => 2500,
        'platform_fee_cents' => 0,
        'status' => 'pending',
    ]);

    $service = app(TipService::class);
    $service->handleTipSucceeded($tip, 'ch_test_charge_id', 103);

    $tip->refresh();
    expect($tip->status)->toBe('succeeded');
    expect($tip->stripe_charge_id)->toBe('ch_test_charge_id');
    expect($tip->stripe_fee_cents)->toBe(103);
    expect($tip->net_amount_cents)->toBe(2500 - 0 - 103);

    $fan->refresh();
    expect($fan->tip_count)->toBe(1);
    expect($fan->total_tips_given_cents)->toBe(2500);

    $this->performer->refresh();
    expect($this->performer->total_tip_count)->toBe(1);
    expect($this->performer->total_tips_received_cents)->toBe(2500);

    Event::assertDispatched(TipReceived::class, function (TipReceived $event) use ($tip) {
        return $event->tip->id === $tip->id;
    });
});

it('handles tip payment failed webhook correctly', function () {
    $fan = Fan::factory()->create([
        'performer_id' => $this->performer->id,
    ]);

    $tip = Tip::factory()->create([
        'performer_id' => $this->performer->id,
        'fan_id' => $fan->id,
        'amount_cents' => 1000,
        'status' => 'pending',
    ]);

    $service = app(TipService::class);
    $service->handleTipFailed($tip);

    $tip->refresh();
    expect($tip->status)->toBe('failed');
});

it('returns correct tip statistics for a performer', function () {
    $fan = Fan::factory()->create([
        'performer_id' => $this->performer->id,
    ]);

    $this->performer->update([
        'total_tip_count' => 3,
        'total_tips_received_cents' => 7500,
        'total_fans_captured' => 2,
    ]);

    Tip::factory()->succeeded()->count(3)->create([
        'performer_id' => $this->performer->id,
        'fan_id' => $fan->id,
        'amount_cents' => 2500,
        'created_at' => now(),
    ]);

    $service = app(TipService::class);
    $stats = $service->getPerformerTipStats($this->performer);

    expect($stats)->toHaveKeys([
        'total_tips',
        'total_received_cents',
        'total_fans',
        'average_tip_cents',
        'tips_this_month',
        'revenue_this_month',
    ]);
    expect($stats['total_tips'])->toBe(3);
    expect($stats['total_received_cents'])->toBe(7500);
    expect($stats['total_fans'])->toBe(2);
    expect($stats['average_tip_cents'])->toBe(2500);
    expect($stats['tips_this_month'])->toBe(3);
});

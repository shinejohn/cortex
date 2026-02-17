<?php

declare(strict_types=1);

use App\Models\AgentClient;
use App\Models\AgentCommission;
use App\Models\BookingAgent;
use App\Services\EventCity\CommissionService;

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
    $this->service = app(CommissionService::class);
});

it('calculates commission based on agent tier rate', function () {
    $agent = BookingAgent::factory()->create(['subscription_tier' => 'free']);
    $client = AgentClient::factory()->active()->create(['booking_agent_id' => $agent->id]);

    $commission = $this->service->calculateCommission(
        $agent,
        $client,
        'booking',
        fake()->uuid(),
        100_000 // $1,000.00 gross
    );

    // Free tier rate is 10%
    expect($commission)->toBeInstanceOf(AgentCommission::class)
        ->and($commission->gross_amount_cents)->toBe(100_000)
        ->and((float) $commission->commission_rate)->toBe(0.10)
        ->and($commission->commission_amount_cents)->toBe(10_000)
        ->and($commission->status)->toBe('pending');
});

it('calculates commission with pro tier rate', function () {
    $agent = BookingAgent::factory()->proTier()->create();
    $client = AgentClient::factory()->active()->create(['booking_agent_id' => $agent->id]);

    $commission = $this->service->calculateCommission(
        $agent,
        $client,
        'booking',
        fake()->uuid(),
        100_000
    );

    // Pro tier rate is 8%
    expect((float) $commission->commission_rate)->toBe(0.08)
        ->and($commission->commission_amount_cents)->toBe(8_000);
});

it('approves a pending commission', function () {
    $commission = AgentCommission::factory()->create(['status' => 'pending']);

    $this->service->approveCommission($commission);

    $commission->refresh();

    expect($commission->status)->toBe('approved');
});

it('marks a commission as paid during payout', function () {
    $agent = BookingAgent::factory()->create();

    $commission1 = AgentCommission::factory()->approved()->create([
        'booking_agent_id' => $agent->id,
        'commission_amount_cents' => 5_000,
    ]);
    $commission2 = AgentCommission::factory()->approved()->create([
        'booking_agent_id' => $agent->id,
        'commission_amount_cents' => 3_000,
    ]);

    // A pending commission should NOT be paid out
    AgentCommission::factory()->create([
        'booking_agent_id' => $agent->id,
        'commission_amount_cents' => 2_000,
        'status' => 'pending',
    ]);

    $result = $this->service->processPayouts($agent);

    expect($result['count'])->toBe(2)
        ->and($result['total_cents'])->toBe(8_000);

    $commission1->refresh();
    $commission2->refresh();

    expect($commission1->status)->toBe('paid')
        ->and($commission1->paid_at)->not->toBeNull()
        ->and($commission2->status)->toBe('paid')
        ->and($commission2->paid_at)->not->toBeNull();
});

it('generates correct commission report for an agent', function () {
    $agent = BookingAgent::factory()->create();

    AgentCommission::factory()->create([
        'booking_agent_id' => $agent->id,
        'commission_amount_cents' => 5_000,
        'status' => 'pending',
    ]);

    AgentCommission::factory()->paid()->create([
        'booking_agent_id' => $agent->id,
        'commission_amount_cents' => 8_000,
    ]);

    $report = $this->service->getCommissionReport($agent);

    expect($report)->toHaveKeys([
        'total_earned',
        'total_pending',
        'total_paid',
        'commission_count',
    ])
        ->and($report['total_earned'])->toBe(13_000)
        ->and($report['total_pending'])->toBe(5_000)
        ->and($report['total_paid'])->toBe(8_000)
        ->and($report['commission_count'])->toBe(2);
});

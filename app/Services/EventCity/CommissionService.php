<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Events\EventCity\CommissionEarned;
use App\Models\AgentClient;
use App\Models\AgentCommission;
use App\Models\BookingAgent;

final class CommissionService
{
    private const TIER_RATES = [
        'free' => 0.10,
        'pro' => 0.08,
        'premium' => 0.05,
    ];

    public function calculateCommission(BookingAgent $agent, AgentClient $client, string $sourceType, string $sourceId, int $grossAmountCents): AgentCommission
    {
        $rate = self::TIER_RATES[$agent->subscription_tier] ?? 0.10;
        $commissionCents = (int) ($grossAmountCents * $rate);

        $commission = AgentCommission::create([
            'booking_agent_id' => $agent->id,
            'agent_client_id' => $client->id,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'gross_amount_cents' => $grossAmountCents,
            'commission_rate' => $rate,
            'commission_amount_cents' => $commissionCents,
            'status' => 'pending',
        ]);

        event(new CommissionEarned($commission));

        return $commission;
    }

    public function approveCommission(AgentCommission $commission): void
    {
        $commission->update(['status' => 'approved']);
    }

    public function processPayouts(BookingAgent $agent): array
    {
        $approved = $agent->commissions()->where('status', 'approved')->get();

        foreach ($approved as $commission) {
            $commission->markAsPaid();
        }

        return [
            'count' => $approved->count(),
            'total_cents' => $approved->sum('commission_amount_cents'),
        ];
    }

    public function getCommissionReport(BookingAgent $agent, ?string $period = null): array
    {
        $query = $agent->commissions();

        if ($period === 'month') {
            $query->where('created_at', '>=', now()->startOfMonth());
        } elseif ($period === 'year') {
            $query->where('created_at', '>=', now()->startOfYear());
        }

        return [
            'total_earned' => $query->sum('commission_amount_cents'),
            'total_pending' => (clone $query)->pending()->sum('commission_amount_cents'),
            'total_paid' => (clone $query)->paid()->sum('commission_amount_cents'),
            'commission_count' => $query->count(),
        ];
    }
}

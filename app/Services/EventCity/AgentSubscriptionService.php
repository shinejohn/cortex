<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Models\BookingAgent;

final class AgentSubscriptionService
{
    private const TIERS = [
        'free' => ['name' => 'Free', 'max_clients' => 3, 'price_cents' => 0, 'commission_rate' => 0.10],
        'pro' => ['name' => 'Pro', 'max_clients' => 15, 'price_cents' => 4900, 'commission_rate' => 0.08],
        'premium' => ['name' => 'Premium', 'max_clients' => 50, 'price_cents' => 14900, 'commission_rate' => 0.05],
    ];

    public function getAvailableTiers(): array
    {
        return self::TIERS;
    }

    public function createSubscription(BookingAgent $agent, string $tier): BookingAgent
    {
        $tierConfig = self::TIERS[$tier] ?? self::TIERS['free'];

        $agent->update([
            'subscription_tier' => $tier,
            'subscription_status' => $tier === 'free' ? 'active' : 'pending',
            'max_clients' => $tierConfig['max_clients'],
        ]);

        return $agent;
    }

    public function cancelSubscription(BookingAgent $agent): void
    {
        $agent->update([
            'subscription_tier' => 'free',
            'subscription_status' => 'active',
            'max_clients' => self::TIERS['free']['max_clients'],
        ]);
    }

    public function handleSubscriptionWebhook(array $data): void
    {
        $agentId = $data['metadata']['agent_id'] ?? null;
        if (! $agentId) {
            return;
        }

        $agent = BookingAgent::find($agentId);
        if (! $agent) {
            return;
        }

        $status = $data['status'] ?? 'inactive';
        $agent->update(['subscription_status' => $status]);
    }
}

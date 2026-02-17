<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Events\EventCity\AgentRegistered;
use App\Events\EventCity\ClientAuthorized;
use App\Models\AgentClient;
use App\Models\BookingAgent;
use App\Models\User;
use Illuminate\Support\Str;
use RuntimeException;

final class AgentManagementService
{
    public function registerAgent(User $user, array $data): BookingAgent
    {
        $agent = BookingAgent::create([
            'user_id' => $user->id,
            'agency_name' => $data['agency_name'],
            'slug' => Str::slug($data['agency_name']).'-'.Str::random(4),
            'bio' => $data['bio'] ?? null,
            'specialties' => $data['specialties'] ?? [],
            'service_areas' => $data['service_areas'] ?? [],
        ]);

        $agent->refresh();

        event(new AgentRegistered($agent));

        return $agent;
    }

    public function addClient(BookingAgent $agent, User $clientUser, array $data = []): AgentClient
    {
        if ($agent->hasReachedClientLimit()) {
            throw new RuntimeException('Client limit reached. Upgrade your subscription to add more clients.');
        }

        $client = AgentClient::create([
            'booking_agent_id' => $agent->id,
            'user_id' => $clientUser->id,
            'client_type' => $data['client_type'] ?? 'performer',
            'permissions' => $data['permissions'] ?? ['manage_bookings', 'view_calendar'],
            'status' => 'active',
            'authorized_at' => now(),
        ]);

        event(new ClientAuthorized($client));

        return $client;
    }

    public function removeClient(AgentClient $client): void
    {
        $client->revoke();
    }

    public function getAgentDashboardData(BookingAgent $agent): array
    {
        return [
            'agent' => $agent->load('user'),
            'active_clients' => $agent->activeClients()->with('user')->get(),
            'pending_clients' => $agent->clients()->where('status', 'pending')->with('user')->get(),
            'total_commissions' => $agent->commissions()->sum('commission_amount_cents'),
            'pending_commissions' => $agent->commissions()->pending()->sum('commission_amount_cents'),
            'recent_commissions' => $agent->commissions()->with('agentClient.user')->latest()->limit(10)->get(),
        ];
    }

    public function searchMarketplace(?string $query = null, ?string $specialty = null, int $perPage = 20)
    {
        $agents = BookingAgent::marketplaceVisible()->with('user');

        if ($query) {
            $agents->where(function ($q) use ($query) {
                $q->where('agency_name', 'like', "%{$query}%")
                    ->orWhere('bio', 'like', "%{$query}%");
            });
        }

        if ($specialty) {
            $agents->whereJsonContains('specialties', $specialty);
        }

        return $agents->orderByDesc('average_rating')->paginate($perPage);
    }
}

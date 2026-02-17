<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventCity\StoreAgentClientRequest;
use App\Models\AgentClient;
use App\Models\BookingAgent;
use App\Models\User;
use App\Services\EventCity\AgentManagementService;
use App\Services\EventCity\CommissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

final class AgentDashboardController extends Controller
{
    public function __construct(
        private readonly AgentManagementService $managementService,
        private readonly CommissionService $commissionService
    ) {}

    public function index(Request $request): Response
    {
        $agent = $this->getAgentForUser($request);
        if (! $agent) {
            return Inertia::render('event-city/agent/register');
        }

        $dashboardData = $this->managementService->getAgentDashboardData($agent);

        return Inertia::render('event-city/dashboard/agent', $dashboardData);
    }

    public function clients(Request $request): Response
    {
        $agent = $this->getAgentForUser($request);
        abort_unless($agent, 403);

        return Inertia::render('event-city/dashboard/agent', [
            'agent' => $agent->load('user'),
            'clients' => $agent->clients()->with('user')->paginate(25),
            'activeTab' => 'clients',
        ]);
    }

    public function addClient(StoreAgentClientRequest $request): JsonResponse
    {
        $agent = $this->getAgentForUser($request);
        if (! $agent) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $clientUser = User::findOrFail($request->user_id);
            $client = $this->managementService->addClient($agent, $clientUser, $request->validated());

            return response()->json(['success' => true, 'client' => $client->load('user')]);
        } catch (RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function removeClient(Request $request, AgentClient $client): JsonResponse
    {
        $agent = $this->getAgentForUser($request);
        if (! $agent || $client->booking_agent_id !== $agent->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $this->managementService->removeClient($client);

        return response()->json(['success' => true]);
    }

    public function commissions(Request $request): Response
    {
        $agent = $this->getAgentForUser($request);
        abort_unless($agent, 403);

        return Inertia::render('event-city/dashboard/agent', [
            'agent' => $agent->load('user'),
            'commissionReport' => $this->commissionService->getCommissionReport($agent, $request->input('period', 'month')),
            'recentCommissions' => $agent->commissions()->with('agentClient.user')->latest()->paginate(25),
            'activeTab' => 'commissions',
        ]);
    }

    public function settings(Request $request): Response
    {
        $agent = $this->getAgentForUser($request);
        abort_unless($agent, 403);

        return Inertia::render('event-city/dashboard/agent', [
            'agent' => $agent->load('user'),
            'activeTab' => 'settings',
        ]);
    }

    private function getAgentForUser(Request $request): ?BookingAgent
    {
        return BookingAgent::where('user_id', $request->user()->id)->first();
    }
}

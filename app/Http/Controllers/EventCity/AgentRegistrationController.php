<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventCity\StoreAgentRequest;
use App\Models\BookingAgent;
use App\Services\EventCity\AgentManagementService;
use App\Services\EventCity\AgentSubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AgentRegistrationController extends Controller
{
    public function __construct(
        private readonly AgentManagementService $managementService,
        private readonly AgentSubscriptionService $subscriptionService
    ) {}

    public function create(Request $request): Response
    {
        $existingAgent = BookingAgent::where('user_id', $request->user()->id)->first();

        if ($existingAgent) {
            return Inertia::render('event-city/agent/register', [
                'existingAgent' => $existingAgent,
                'tiers' => $this->subscriptionService->getAvailableTiers(),
            ]);
        }

        return Inertia::render('event-city/agent/register', [
            'tiers' => $this->subscriptionService->getAvailableTiers(),
        ]);
    }

    public function store(StoreAgentRequest $request): RedirectResponse
    {
        $existingAgent = BookingAgent::where('user_id', $request->user()->id)->first();

        if ($existingAgent) {
            return redirect()->route('agent.dashboard');
        }

        $this->managementService->registerAgent($request->user(), $request->validated());

        return redirect()->route('agent.dashboard');
    }
}

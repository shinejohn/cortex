<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Models\BookingAgent;
use App\Services\EventCity\AgentManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AgentMarketplaceController extends Controller
{
    public function __construct(
        private readonly AgentManagementService $managementService
    ) {}

    public function index(Request $request): Response
    {
        $agents = $this->managementService->searchMarketplace(
            $request->input('q'),
            $request->input('specialty'),
        );

        return Inertia::render('event-city/agent/marketplace', [
            'agents' => $agents,
            'query' => $request->input('q'),
            'specialty' => $request->input('specialty'),
        ]);
    }

    public function show(BookingAgent $agent): Response
    {
        if (! $agent->is_marketplace_visible) {
            abort(404);
        }

        return Inertia::render('event-city/agent/show', [
            'agent' => $agent->load('user'),
            'activeClients' => $agent->activeClients()->count(),
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyProgram;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class LoyaltyController extends Controller
{
    public function __construct(
        private readonly LoyaltyService $loyaltyService
    ) {}

    /**
     * Show the loyalty program dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $business = $user->business;

        if (! $business) {
            return Inertia::render('downtown-guide/dashboard/business/create');
        }

        $program = $this->loyaltyService->getProgram($business);
        $stats = $program ? $this->loyaltyService->getBusinessStats($business) : null;

        return Inertia::render('downtown-guide/dashboard/loyalty/index', [
            'program' => $program,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created loyalty program.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();
        $business = $user->business;

        if (! $business) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'points_per_dollar' => 'required|integer|min:1',
            // Add other fields as per model
        ]);

        $this->loyaltyService->createProgram($business, $validated);

        return redirect()->route('downtown-guide.dashboard.loyalty.index')
            ->with('success', 'Loyalty program created successfully.');
    }

    /**
     * Update the loyalty program.
     */
    public function update(Request $request, LoyaltyProgram $program): \Illuminate\Http\RedirectResponse
    {
        // Add auth/policy check

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'points_per_dollar' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $this->loyaltyService->updateProgram($program, $validated);

        return redirect()->route('downtown-guide.dashboard.loyalty.index')
            ->with('success', 'Loyalty program updated successfully.');
    }
}

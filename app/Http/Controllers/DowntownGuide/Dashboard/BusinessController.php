<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\BusinessService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BusinessController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService
    ) {}

    /**
     * Show the form for editing the business profile.
     */
    /**
     * Show the form for editing the business profile.
     */
    /**
     * Show the form for editing the business profile.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        // Load the relationship
        $user->load('currentWorkspace.business');

        $workspace = $user->currentWorkspace;
        $business = $workspace?->business;

        if (! $business) {
            return Inertia::render('downtown-guide/dashboard/business/create');
        }

        return Inertia::render('downtown-guide/dashboard/business/edit', [
            'business' => $business,
        ]);
    }

    /**
     * Show the form for creating a new business.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $user->load('currentWorkspace.business');

        $workspace = $user->currentWorkspace;

        if ($workspace?->business) {
            return Inertia::render('downtown-guide/dashboard/business/edit', [
                'business' => $workspace->business,
            ]);
        }

        return Inertia::render('downtown-guide/dashboard/business/create');
    }

    /**
     * Store a newly created business.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();
        $user->load('currentWorkspace.business');
        $workspace = $user->currentWorkspace;

        if (! $workspace) {
            // Should theoretically not happen if middleware is set up correctly, but handle it
            return redirect()->back()->withErrors(['message' => 'You must have a workspace to create a business.']);
        }

        if ($workspace->business) {
            return redirect()->route('downtown-guide.dashboard.business.edit');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip' => 'required|string|max:20',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'category' => 'required|string',
        ]);

        $data = array_merge($validated, ['workspace_id' => $workspace->id]);

        $this->businessService->create($data);

        return redirect()->route('downtown-guide.dashboard.business.edit')
            ->with('success', 'Business profile created successfully.');
    }

    /**
     * Update the business profile.
     */
    public function update(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();
        $user->load('currentWorkspace.business');
        $workspace = $user->currentWorkspace;
        $business = $workspace?->business;

        if (! $business) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip' => 'required|string|max:20',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'category' => 'required|string',
        ]);

        $this->businessService->update($business, $validated);

        return redirect()->route('downtown-guide.dashboard.business.edit')
            ->with('success', 'Business profile updated successfully.');
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\AIEmployee;
use App\Models\Business;
use App\Services\AlphaSite\AIEmployeeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

final class AIEmployeeController extends Controller
{
    public function __construct(
        private readonly AIEmployeeService $employeeService
    ) {}

    /**
     * Display the AI Team dashboard.
     */
    public function index(Request $request): Response
    {
        $business = $this->getClaimedBusiness($request);
        $employees = $this->employeeService->getEmployees($business);

        return Inertia::render('alphasite/crm/ai-team/index', [
            'business' => $business,
            'employees' => $employees,
            'availableRoles' => $this->getAvailableRoles(),
            'subscription' => $this->getSubscriptionProps($business->subscription),
        ]);
    }

    /**
     * Hire a new employee.
     */
    public function store(Request $request): RedirectResponse
    {
        $business = $this->getClaimedBusiness($request);

        $request->validate([
            'role' => ['required', 'string', Rule::in(array_column($this->getAvailableRoles(), 'id'))],
            'name' => 'required|string|max:255',
            'personality_config' => 'nullable|array',
        ]);

        $this->employeeService->hireEmployee(
            $business,
            $request->role,
            $request->name,
            $request->personality_config
        );

        return redirect()->back()->with('success', 'New AI employee hired successfully!');
    }

    /**
     * Update an employee.
     */
    public function update(Request $request, string $employeeId): RedirectResponse
    {
        $business = $this->getClaimedBusiness($request);
        $employee = AIEmployee::where('business_id', $business->id)->findOrFail($employeeId);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'personality_config' => 'nullable|array',
            'status' => 'sometimes|string|in:active,paused',
        ]);

        $this->employeeService->updateEmployee($employee, $request->only(['name', 'personality_config', 'status']));

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    /**
     * Fire an employee.
     */
    public function destroy(Request $request, string $employeeId): RedirectResponse
    {
        $business = $this->getClaimedBusiness($request);
        $employee = AIEmployee::where('business_id', $business->id)->findOrFail($employeeId);

        $this->employeeService->fireEmployee($employee);

        return redirect()->back()->with('success', 'Employee fired.');
    }

    private function getSubscriptionProps(?object $subscription): ?array
    {
        if (! $subscription) {
            return null;
        }

        return [
            'tier' => $subscription->tier ?? 'basic',
            'status' => $subscription->status ?? 'active',
            'trial_expires_at' => $subscription->trial_expires_at?->toIso8601String(),
            'ai_services_enabled' => $subscription->ai_services_enabled ?? [],
        ];
    }

    private function getClaimedBusiness(Request $request): Business
    {
        $business = Business::where('claimed_by_id', $request->user()->id)->first();

        if (! $business) {
            abort(404, 'No claimed business found');
        }

        return $business;
    }

    private function getAvailableRoles(): array
    {
        return [
            ['id' => 'marketing_manager', 'label' => 'Marketing Manager', 'description' => 'Manages campaigns and strategy'],
            ['id' => 'social_media_specialist', 'label' => 'Social Media Specialist', 'description' => 'Post creation and engagement'],
            ['id' => 'customer_support_agent', 'label' => 'Customer Support', 'description' => 'First-line response handling'],
            ['id' => 'data_analyst', 'label' => 'Data Analyst', 'description' => 'Business intelligence and insights'],
        ];
    }
}

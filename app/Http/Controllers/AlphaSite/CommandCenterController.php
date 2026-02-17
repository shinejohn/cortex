<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\AlphaSite\AIEmployeeService;
use App\Services\AlphaSite\AnalyticsService;
use App\Services\AlphaSite\ExecutiveCommandCenterService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

final class CommandCenterController extends Controller
{
    public function __construct(
        private readonly ExecutiveCommandCenterService $commandCenterService,
        private readonly AnalyticsService $analyticsService,
        private readonly AIEmployeeService $employeeService
    ) {}

    /**
     * Main Executive Command Center Dashboard
     */
    public function index(Request $request): Response
    {
        $business = $this->getClaimedBusiness($request);
        $commandCenterData = $this->commandCenterService->getCommandCenterData($business);

        // Add AI Employee status summary
        $employees = $this->employeeService->getEmployees($business);
        $activeEmployees = $employees->where('status', 'active')->count();
        $commandCenterData['metrics']['active_ai_employees'] = $activeEmployees;

        return Inertia::render('alphasite/crm/command-center', [
            'business' => $business,
            'subscription' => $this->getSubscriptionProps($business->subscription),
            'commandCenter' => $commandCenterData,
        ]);
    }

    /**
     * Revenue & Financial Analytics Page
     */
    public function revenue(Request $request): Response
    {
        $business = $this->getClaimedBusiness($request);

        $period = $request->input('period', '30d');
        $endDate = Carbon::now();
        $startDate = match ($period) {
            '7d' => Carbon::now()->subDays(7),
            '90d' => Carbon::now()->subDays(90),
            'ytd' => Carbon::now()->startOfYear(),
            default => Carbon::now()->subDays(30),
        };

        $metrics = $this->analyticsService->getMetrics($business, $startDate, $endDate);

        return Inertia::render('alphasite/crm/revenue', [
            'business' => $business,
            'subscription' => $this->getSubscriptionProps($business->subscription),
            'metrics' => $metrics,
            'period' => $period,
        ]);
    }

    /**
     * Community & Network Page
     */
    public function community(Request $request): Response
    {
        $business = $this->getClaimedBusiness($request);

        // Fetch related businesses, local network status, etc.
        // This is a placeholder for future implementation of detailed community graph

        return Inertia::render('alphasite/crm/community', [
            'business' => $business,
            'subscription' => $this->getSubscriptionProps($business->subscription),
        ]);
    }

    private function getClaimedBusiness(Request $request): Business
    {
        $business = Business::where('claimed_by_id', $request->user()->id)->first();

        if (! $business) {
            abort(404, 'No claimed business found');
        }

        return $business;
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
}

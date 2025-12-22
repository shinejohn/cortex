<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\BusinessService;
use App\Services\AlphaSite\SMBCrmService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SMBCrmController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly SMBCrmService $crmService
    ) {}

    /**
     * CRM Dashboard
     */
    public function dashboard(Request $request): Response
    {
        // TODO: Get business from authenticated user's claimed businesses
        $business = Business::where('claimed_by_id', $request->user()->id)->first();
        
        if (!$business) {
            abort(404, 'No claimed business found');
        }

        $dashboardData = $this->crmService->getDashboardData($business);

        return Inertia::render('alphasite/crm/dashboard', [
            'business' => $business,
            'dashboard' => $dashboardData,
        ]);
    }

    /**
     * Customers list
     */
    public function customers(Request $request): Response
    {
        $business = Business::where('claimed_by_id', $request->user()->id)->first();
        
        if (!$business) {
            abort(404);
        }

        $customers = $this->crmService->getCustomers($business, $request->all());

        return Inertia::render('alphasite/crm/customers', [
            'business' => $business,
            'customers' => $customers,
        ]);
    }

    /**
     * Show customer
     */
    public function showCustomer(Request $request, string $customer): Response
    {
        $business = Business::where('claimed_by_id', $request->user()->id)->first();
        
        if (!$business) {
            abort(404);
        }

        $customerData = $this->crmService->getCustomer($business, $customer);

        return Inertia::render('alphasite/crm/customer/show', [
            'business' => $business,
            'customer' => $customerData,
        ]);
    }

    /**
     * Interactions list
     */
    public function interactions(Request $request): Response
    {
        $business = Business::where('claimed_by_id', $request->user()->id)->first();
        
        if (!$business) {
            abort(404);
        }

        $interactions = $this->crmService->getInteractions($business, $request->all());

        return Inertia::render('alphasite/crm/interactions', [
            'business' => $business,
            'interactions' => $interactions,
        ]);
    }

    /**
     * FAQs management
     */
    public function faqs(Request $request): Response
    {
        $business = Business::where('claimed_by_id', $request->user()->id)->first();
        
        if (!$business) {
            abort(404);
        }

        $faqs = $this->crmService->getFaqs($business);

        return Inertia::render('alphasite/crm/faqs', [
            'business' => $business,
            'faqs' => $faqs,
        ]);
    }

    /**
     * Store FAQ
     */
    public function storeFaq(Request $request)
    {
        $business = Business::where('claimed_by_id', $request->user()->id)->first();
        
        if (!$business) {
            abort(404);
        }

        $request->validate([
            'question' => 'required|string',
            'answer' => 'required|string',
            'category' => 'nullable|string',
        ]);

        $this->crmService->createFaq($business, $request->all());

        return redirect()->back()->with('success', 'FAQ created successfully');
    }

    /**
     * Surveys management
     */
    public function surveys(Request $request): Response
    {
        $business = Business::where('claimed_by_id', $request->user()->id)->first();
        
        if (!$business) {
            abort(404);
        }

        $surveys = $this->crmService->getSurveys($business);

        return Inertia::render('alphasite/crm/surveys', [
            'business' => $business,
            'surveys' => $surveys,
        ]);
    }

    /**
     * AI Services configuration
     */
    public function aiServices(Request $request): Response
    {
        $business = Business::where('claimed_by_id', $request->user()->id)->first();
        
        if (!$business) {
            abort(404);
        }

        $servicesConfig = $this->crmService->getAIServicesConfig($business);

        return Inertia::render('alphasite/crm/ai-services', [
            'business' => $business,
            'servicesConfig' => $servicesConfig,
        ]);
    }
}

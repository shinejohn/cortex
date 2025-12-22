<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\SMBCrmCustomer;
use App\Models\SMBCrmInteraction;
use App\Models\BusinessFaq;
use App\Models\BusinessSurvey;
use App\Services\AIService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * SMB CRM Service - Manages the SMB's customer database
 * NOTE: This is SEPARATE from Fibonacco's internal CRM
 */
final class SMBCrmService
{
    // public function __construct(
    //     private readonly AIService $aiService
    // ) {}

    /**
     * Create or update a customer in the SMB's CRM
     */
    public function createOrUpdateCustomer(
        Business $business,
        array $data,
        string $source = 'alphasite'
    ): SMBCrmCustomer {
        return SMBCrmCustomer::updateOrCreate(
            [
                'business_id' => $business->id,
                'email' => $data['email'] ?? null,
            ],
            [
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'phone' => $data['phone'] ?? null,
                'source' => $source,
                'status' => $data['status'] ?? 'lead',
                'last_interaction_at' => now(),
            ]
        );
    }

    /**
     * Record an interaction (AI or human)
     */
    public function recordInteraction(
        Business $business,
        ?SMBCrmCustomer $customer,
        string $type,
        array $data
    ): SMBCrmInteraction {
        $interaction = SMBCrmInteraction::create([
            'business_id' => $business->id,
            'customer_id' => $customer?->id,
            'interaction_type' => $type,
            'channel' => $data['channel'] ?? 'alphasite',
            'direction' => $data['direction'] ?? 'inbound',
            'subject' => $data['subject'] ?? null,
            'content' => $data['content'] ?? null,
            'handled_by' => $data['handled_by'] ?? 'ai',
            'ai_service_used' => $data['ai_service'] ?? null,
            'ai_confidence_score' => $data['confidence'] ?? null,
            'outcome' => $data['outcome'] ?? 'pending',
            'sentiment' => $data['sentiment'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'created_at' => now(),
        ]);

        // Update customer's last interaction
        if ($customer) {
            $customer->update(['last_interaction_at' => now()]);
        }

        return $interaction;
    }

    /**
     * Get CRM dashboard data for a business owner
     */
    public function getDashboardData(Business $business): array
    {
        $customers = SMBCrmCustomer::where('business_id', $business->id);
        $interactions = SMBCrmInteraction::where('business_id', $business->id);

        return [
            'total_customers' => $customers->count(),
            'new_leads_today' => $customers->clone()
                ->where('status', 'lead')
                ->whereDate('created_at', today())
                ->count(),
            'interactions_today' => $interactions->clone()
                ->whereDate('created_at', today())
                ->count(),
            'ai_handled_rate' => $this->calculateAIHandledRate($business),
            'average_health_score' => $customers->avg('health_score') ?? 0,
            'recent_interactions' => $interactions->clone()
                ->with('customer')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
            'customers_needing_attention' => $customers->clone()
                ->where('health_score', '<', 50)
                ->orderBy('health_score')
                ->limit(5)
                ->get(),
        ];
    }

    /**
     * Get customers with pagination
     */
    public function getCustomers(Business $business, array $filters = []): LengthAwarePaginator
    {
        $query = SMBCrmCustomer::where('business_id', $business->id);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('first_name', 'like', "%{$filters['search']}%")
                  ->orWhere('last_name', 'like', "%{$filters['search']}%")
                  ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderByDesc('last_interaction_at')
            ->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Get customer details
     */
    public function getCustomer(Business $business, string $customerId): array
    {
        $customer = SMBCrmCustomer::where('business_id', $business->id)
            ->findOrFail($customerId);

        return [
            'customer' => $customer,
            'interactions' => $customer->interactions()->orderByDesc('created_at')->get(),
            'survey_responses' => $customer->surveyResponses()->orderByDesc('completed_at')->get(),
        ];
    }

    /**
     * Get interactions
     */
    public function getInteractions(Business $business, array $filters = []): LengthAwarePaginator
    {
        $query = SMBCrmInteraction::where('business_id', $business->id)
            ->with('customer');

        if (isset($filters['type'])) {
            $query->where('interaction_type', $filters['type']);
        }

        if (isset($filters['handled_by'])) {
            $query->where('handled_by', $filters['handled_by']);
        }

        return $query->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Get FAQs
     */
    public function getFaqs(Business $business): Collection
    {
        return BusinessFaq::where('business_id', $business->id)
            ->orderBy('display_order')
            ->orderBy('category')
            ->get();
    }

    /**
     * Create FAQ
     */
    public function createFaq(Business $business, array $data): BusinessFaq
    {
        return BusinessFaq::create([
            'business_id' => $business->id,
            'question' => $data['question'],
            'answer' => $data['answer'],
            'category' => $data['category'] ?? null,
        ]);
    }

    /**
     * Get surveys
     */
    public function getSurveys(Business $business): Collection
    {
        return BusinessSurvey::where('business_id', $business->id)
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get AI services configuration
     */
    public function getAIServicesConfig(Business $business): array
    {
        $subscription = $business->subscription;
        
        if (!$subscription) {
            return [
                'enabled' => false,
                'services' => [],
            ];
        }

        return [
            'enabled' => true,
            'services' => $subscription->ai_services_enabled ?? [],
        ];
    }

    /**
     * Calculate percentage of interactions handled by AI
     */
    private function calculateAIHandledRate(Business $business): float
    {
        $total = SMBCrmInteraction::where('business_id', $business->id)
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->count();

        if ($total === 0) {
            return 100.0;
        }

        $aiHandled = SMBCrmInteraction::where('business_id', $business->id)
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->where('handled_by', 'ai')
            ->count();

        return round(($aiHandled / $total) * 100, 1);
    }
}


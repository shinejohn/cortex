<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\AiConversation;
use App\Models\Business;
use App\Models\SMBCrmCustomer;
use App\Models\SMBCrmInteraction;
use Illuminate\Support\Carbon;

/**
 * Executive Command Center – Real-time dashboard data for business owners.
 * Aggregates metrics, alerts, and activity for the command center view.
 */
final class ExecutiveCommandCenterService
{
    public function __construct(
        private readonly SMBCrmService $crmService
    ) {}

    /**
     * Get all command center data: metrics, alerts, activity, quick actions.
     *
     * @return array{metrics: array, alerts: array, activity: array, quick_actions: array}
     */
    public function getCommandCenterData(Business $business): array
    {
        return [
            'metrics' => $this->getMetrics($business),
            'alerts' => $this->getAlerts($business),
            'activity' => $this->getRecentActivity($business),
            'quick_actions' => $this->getQuickActions($business),
        ];
    }

    /**
     * Get real-time metrics for the dashboard.
     *
     * @return array<string, mixed>
     */
    public function getMetrics(Business $business): array
    {
        $interactions = SMBCrmInteraction::where('business_id', $business->id);
        $customers = SMBCrmCustomer::where('business_id', $business->id);
        $conversations = AiConversation::where('business_id', $business->id);

        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();

        $interactionsToday = (clone $interactions)->whereDate('created_at', $today)->count();
        $interactionsThisWeek = (clone $interactions)->where('created_at', '>=', $weekStart)->count();
        $newLeadsToday = (clone $customers)->where('status', 'lead')->whereDate('created_at', $today)->count();
        $conversationsToday = (clone $conversations)->whereDate('created_at', $today)->count();

        $aiHandledRate = $this->crmService->getDashboardData($business)['ai_handled_rate'] ?? 0;
        $totalCustomers = $customers->count();
        $avgHealthScore = $customers->avg('health_score') ?? 0;

        $escalatedCount = (clone $interactions)
            ->whereNotNull('escalated_reason')
            ->where('created_at', '>=', $weekStart)
            ->count();

        return [
            'total_customers' => $totalCustomers,
            'new_leads_today' => $newLeadsToday,
            'interactions_today' => $interactionsToday,
            'interactions_this_week' => $interactionsThisWeek,
            'ai_chat_sessions_today' => $conversationsToday,
            'ai_handled_rate' => round($aiHandledRate, 1),
            'average_health_score' => round((float) $avgHealthScore, 1),
            'escalated_this_week' => $escalatedCount,
        ];
    }

    /**
     * Get alerts requiring attention (critical, warning, info).
     *
     * @return array<int, array{id: string, type: string, title: string, message: string, action_url?: string, action_label?: string, created_at: string}>
     */
    public function getAlerts(Business $business): array
    {
        $alerts = [];
        $subscription = $business->subscription;

        // Trial expiring
        if ($subscription && $subscription->tier === 'trial' && $subscription->trial_expires_at) {
            $daysLeft = Carbon::parse($subscription->trial_expires_at)->diffInDays(Carbon::now(), false);
            if ($daysLeft <= 7) {
                $alerts[] = [
                    'id' => 'trial-expiring',
                    'type' => $daysLeft <= 3 ? 'critical' : 'warning',
                    'title' => 'Trial expiring',
                    'message' => $daysLeft <= 0
                        ? 'Your trial has expired. Subscribe to keep AI features.'
                        : "Your trial expires in {$daysLeft} day(s). Subscribe to keep AI features.",
                    'action_url' => route('alphasite.crm.ai'),
                    'action_label' => 'Subscribe now',
                    'created_at' => now()->toIso8601String(),
                ];
            }
        }

        // Customers needing attention (low health score)
        $needingAttention = SMBCrmCustomer::where('business_id', $business->id)
            ->where('health_score', '<', 50)
            ->whereNotNull('health_score')
            ->count();

        if ($needingAttention > 0) {
            $alerts[] = [
                'id' => 'customers-need-attention',
                'type' => 'warning',
                'title' => 'Customers need attention',
                'message' => "{$needingAttention} customer(s) have low health scores.",
                'action_url' => route('alphasite.crm.customers'),
                'action_label' => 'View customers',
                'created_at' => now()->toIso8601String(),
            ];
        }

        // Escalated conversations
        $escalatedCount = SMBCrmInteraction::where('business_id', $business->id)
            ->whereNotNull('escalated_reason')
            ->whereDate('created_at', '>=', Carbon::now()->subDays(7))
            ->count();

        if ($escalatedCount > 0) {
            $alerts[] = [
                'id' => 'escalated-conversations',
                'type' => 'warning',
                'title' => 'Escalated conversations',
                'message' => "{$escalatedCount} conversation(s) were escalated this week and may need follow-up.",
                'action_url' => route('alphasite.crm.interactions'),
                'action_label' => 'View interactions',
                'created_at' => now()->toIso8601String(),
            ];
        }

        // No FAQs configured (for AI concierge businesses)
        $hasConcierge = $subscription && in_array('concierge', $subscription->ai_services_enabled ?? []);
        $faqCount = $business->faqs()->count();
        if ($hasConcierge && $faqCount === 0) {
            $alerts[] = [
                'id' => 'no-faqs',
                'type' => 'info',
                'title' => 'Add FAQs for AI',
                'message' => 'Add FAQs to improve your AI assistant\'s responses.',
                'action_url' => route('alphasite.crm.faqs'),
                'action_label' => 'Add FAQs',
                'created_at' => now()->toIso8601String(),
            ];
        }

        return $alerts;
    }

    /**
     * Get recent activity feed (interactions, new customers, etc.).
     *
     * @return array<int, array{id: string, type: string, title: string, subtitle?: string, created_at: string, url?: string}>
     */
    public function getRecentActivity(Business $business): array
    {
        $activity = [];

        $interactions = SMBCrmInteraction::where('business_id', $business->id)
            ->with('customer')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get();

        foreach ($interactions as $i) {
            $customerName = $i->customer
                ? mb_trim(($i->customer->first_name ?? '').' '.($i->customer->last_name ?? '')) ?: $i->customer->email ?? 'Unknown'
                : 'Anonymous';

            $activity[] = [
                'id' => $i->id,
                'type' => 'interaction',
                'title' => "{$i->interaction_type} from {$customerName}",
                'subtitle' => "{$i->channel} · {$i->outcome}".($i->handled_by === 'ai' ? ' (AI)' : ''),
                'created_at' => $i->created_at->toIso8601String(),
                'url' => route('alphasite.crm.interactions'),
            ];
        }

        $newCustomers = SMBCrmCustomer::where('business_id', $business->id)
            ->whereDate('created_at', '>=', Carbon::now()->subDays(3))
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        foreach ($newCustomers as $c) {
            $name = mb_trim(($c->first_name ?? '').' '.($c->last_name ?? '')) ?: $c->email ?? 'Unknown';
            $activity[] = [
                'id' => 'customer-'.$c->id,
                'type' => 'new_customer',
                'title' => "New lead: {$name}",
                'subtitle' => $c->email ?? 'No email',
                'created_at' => $c->created_at->toIso8601String(),
                'url' => route('alphasite.crm.customer.show', $c->id),
            ];
        }

        usort($activity, fn ($a, $b) => strcmp($b['created_at'], $a['created_at']));

        return array_slice($activity, 0, 20);
    }

    /**
     * Get quick action links for the command center.
     *
     * @return array<int, array{label: string, url: string, icon: string}>
     */
    public function getQuickActions(Business $business): array
    {
        $publicUrl = $business->alphasite_subdomain
            ? "https://{$business->alphasite_subdomain}.alphasite.com"
            : route('alphasite.business.show', $business->slug);

        return [
            ['label' => 'View public page', 'url' => $publicUrl, 'icon' => 'external-link'],
            ['label' => 'Manage FAQs', 'url' => route('alphasite.crm.faqs'), 'icon' => 'help-circle'],
            ['label' => 'View customers', 'url' => route('alphasite.crm.customers'), 'icon' => 'users'],
            ['label' => 'Interactions', 'url' => route('alphasite.crm.interactions'), 'icon' => 'message-square'],
            ['label' => 'AI Services', 'url' => route('alphasite.crm.ai'), 'icon' => 'sparkles'],
            ['label' => 'Surveys', 'url' => route('alphasite.crm.surveys'), 'icon' => 'clipboard-list'],
        ];
    }
}

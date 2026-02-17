<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\AIEmployeeTask;
use App\Models\Business;
use App\Models\BusinessAnalyticsSnapshot;
use App\Models\SMBCrmCustomer;
use App\Models\SMBCrmInteraction;
use Illuminate\Support\Carbon;

final class AnalyticsService
{
    /**
     * Generate or update the snapshot for a specific date.
     */
    public function generateDailySnapshot(Business $business, ?Carbon $date = null): BusinessAnalyticsSnapshot
    {
        $date = $date ?? Carbon::yesterday();
        $start = $date->copy()->startOfDay();
        $end = $date->copy()->endOfDay();

        // 1. Interaction Metrics
        $interactions = SMBCrmInteraction::where('business_id', $business->id)
            ->whereBetween('created_at', [$start, $end])
            ->get();

        $conversationsCount = $interactions->count();
        $aiHandledCount = $interactions->where('handled_by', 'ai')->count();
        $humanHandledCount = $conversationsCount - $aiHandledCount;

        // 2. CRM Metrics
        $newLeadsCount = SMBCrmCustomer::where('business_id', $business->id)
            ->whereBetween('created_at', [$start, $end])
            ->count();

        // 3. AI Employee Tasks
        $tasks = AIEmployeeTask::where('business_id', $business->id)
            ->whereBetween('completed_at', [$start, $end])
            ->get();

        $tasksCompleted = $tasks->where('status', 'completed')->count();
        $tasksFailed = $tasks->where('status', 'failed')->count();

        // 4. Financials (Placeholder / Estimated from subscription)
        // In a real scenario, this would pull from Stripe charges or internal ledger
        $revenue = 0;
        // Example: logic to sum up order values if Order model exists and linked

        $snapshot = BusinessAnalyticsSnapshot::updateOrCreate(
            [
                'business_id' => $business->id,
                'date' => $date->format('Y-m-d'),
            ],
            [
                'metrics' => [
                    'page_views' => 0, // Placeholder for GA/Plausible integration
                    'unique_visitors' => 0,
                    'new_leads' => $newLeadsCount,
                ],
                'financials' => [
                    'revenue' => $revenue,
                    'mrr' => 0, // Calculate from active subscriptions
                ],
                'interactions' => [
                    'total' => $conversationsCount,
                    'ai_handled' => $aiHandledCount,
                    'human_handled' => $humanHandledCount,
                    'ai_tasks_completed' => $tasksCompleted,
                    'ai_tasks_failed' => $tasksFailed,
                ],
            ]
        );

        return $snapshot;
    }

    /**
     * Get analytics for a specific period.
     */
    public function getMetrics(Business $business, Carbon $start, Carbon $end): array
    {
        $snapshots = BusinessAnalyticsSnapshot::where('business_id', $business->id)
            ->whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->orderBy('date')
            ->get();

        return [
            'dates' => $snapshots->pluck('date')->map(fn ($d) => $d->format('M j'))->toArray(),
            'interactions' => $snapshots->pluck('interactions.total')->toArray(),
            'leads' => $snapshots->pluck('metrics.new_leads')->toArray(),
            'revenue' => $snapshots->pluck('financials.revenue')->toArray(),
            'ai_tasks' => $snapshots->pluck('interactions.ai_tasks_completed')->toArray(),
        ];
    }
}

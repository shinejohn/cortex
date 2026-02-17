<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Event;
use App\Models\Share;
use Illuminate\Support\Facades\DB;

final class EventReportService
{
    public function getEventReport(Event $event): array
    {
        $event->load(['ticketPlans', 'ticketOrders.items']);

        $totalTickets = $event->ticketOrders()->where('status', 'completed')->with('items')->get()
            ->sum(fn ($o) => $o->items->sum('quantity'));

        $revenue = $event->ticketOrders()->where('status', 'completed')->sum('total');
        $checkedIn = $event->checkIns()->count();
        $rate = $totalTickets > 0 ? round(($checkedIn / $totalTickets) * 100, 1) : 0;

        $byPlan = $event->ticketPlans->map(function ($plan) {
            $sold = $plan->max_quantity - $plan->available_quantity;
            $planRevenue = DB::table('ticket_order_items')
                ->join('ticket_orders', 'ticket_order_items.ticket_order_id', '=', 'ticket_orders.id')
                ->where('ticket_order_items.ticket_plan_id', $plan->id)
                ->where('ticket_orders.status', 'completed')
                ->selectRaw('SUM(ticket_order_items.unit_price * ticket_order_items.quantity) as rev')
                ->value('rev') ?? 0;

            return [
                'name' => $plan->name,
                'sold' => $sold,
                'total' => $plan->max_quantity,
                'revenue' => (float) $planRevenue,
            ];
        })->toArray();

        $shares = Share::where('shareable_type', Event::class)
            ->where('shareable_id', $event->id)
            ->sum('click_count');

        return [
            'ticket_sales' => [
                'total_sold' => $totalTickets,
                'revenue' => (float) $revenue,
                'by_plan' => $byPlan,
            ],
            'attendance' => [
                'checked_in' => $checkedIn,
                'total_tickets' => $totalTickets,
                'rate' => $rate,
            ],
            'engagement' => [
                'saves' => $event->plannedEvents()->count(),
                'shares' => $shares,
                'follows' => $event->follows()->count(),
            ],
        ];
    }
}

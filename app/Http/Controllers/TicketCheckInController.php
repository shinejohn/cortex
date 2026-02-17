<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Services\TicketCheckInService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TicketCheckInController extends Controller
{
    public function __construct(
        private readonly TicketCheckInService $ticketCheckInService
    ) {}

    public function scan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ticket_code' => 'required|string',
        ]);

        $result = $this->ticketCheckInService->checkInByTicketCode(
            $validated['ticket_code'],
            $request->user()
        );

        $ticket = $result['ticket'];
        $data = [
            'success' => $result['success'],
            'error' => $result['error'] ?? null,
        ];

        if ($ticket) {
            $data['ticket'] = [
                'id' => $ticket->id,
                'ticket_code' => $ticket->ticket_code,
                'event' => $ticket->ticketOrder?->event ? [
                    'id' => $ticket->ticketOrder->event->id,
                    'title' => $ticket->ticketOrder->event->title,
                ] : null,
                'plan' => $ticket->ticketPlan ? ['name' => $ticket->ticketPlan->name] : null,
            ];
        }

        return response()->json($data);
    }

    public function dashboard(Request $request, Event $event): Response
    {
        $event->load(['venue', 'ticketPlans', 'ticketOrders']);
        $totalTickets = $event->ticketOrders()->where('status', 'completed')->with('items')->get()
            ->sum(fn ($o) => $o->items->sum('quantity'));
        $checkedIn = $event->checkIns()->count();
        $recentCheckIns = $event->checkIns()->with('user')->latest('checked_in_at')->limit(20)->get();

        return Inertia::render('event-city/check-ins/dashboard', [
            'event' => $event,
            'totalTickets' => $totalTickets,
            'checkedIn' => $checkedIn,
            'recentCheckIns' => $recentCheckIns,
        ]);
    }

    public function scannerPage(Request $request, Event $event): Response
    {
        $event->load(['venue', 'ticketPlans']);
        $checkedIn = $event->checkIns()->count();
        $totalTickets = $event->ticketOrders()->where('status', 'completed')->with('items')->get()
            ->sum(fn ($o) => $o->items->sum('quantity'));
        $recentCheckIns = $event->checkIns()->with('user')->latest('checked_in_at')->limit(10)->get();

        return Inertia::render('event-city/check-ins/scanner', [
            'event' => $event,
            'checkedIn' => $checkedIn,
            'totalTickets' => (int) $totalTickets,
            'recentCheckIns' => $recentCheckIns,
        ]);
    }
}

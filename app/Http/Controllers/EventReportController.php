<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Services\EventReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class EventReportController extends Controller
{
    public function __construct(
        private readonly EventReportService $eventReportService
    ) {}

    public function show(Request $request, Event $event): Response
    {
        $report = $this->eventReportService->getEventReport($event);

        return Inertia::render('event-city/dashboard/event-report', [
            'event' => $event->load('venue'),
            'report' => $report,
        ]);
    }

    public function export(Event $event): StreamedResponse
    {
        $report = $this->eventReportService->getEventReport($event);

        $filename = "event-report-{$event->id}-".now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($report, $event) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Event Report', $event->title]);
            fputcsv($out, ['Generated', now()->toDateTimeString()]);
            fputcsv($out, []);
            fputcsv($out, ['Ticket Sales']);
            fputcsv($out, ['Total Sold', $report['ticket_sales']['total_sold']]);
            fputcsv($out, ['Revenue', $report['ticket_sales']['revenue']]);
            fputcsv($out, []);
            fputcsv($out, ['By Plan', 'Sold', 'Total', 'Revenue']);
            foreach ($report['ticket_sales']['by_plan'] as $plan) {
                fputcsv($out, [$plan['name'], $plan['sold'], $plan['total'], $plan['revenue']]);
            }
            fputcsv($out, []);
            fputcsv($out, ['Attendance']);
            fputcsv($out, ['Checked In', $report['attendance']['checked_in']]);
            fputcsv($out, ['Total Tickets', $report['attendance']['total_tickets']]);
            fputcsv($out, ['Rate %', $report['attendance']['rate']]);
            fputcsv($out, []);
            fputcsv($out, ['Engagement']);
            fputcsv($out, ['Saves', $report['engagement']['saves']]);
            fputcsv($out, ['Share Clicks', $report['engagement']['shares']]);
            fputcsv($out, ['Follows', $report['engagement']['follows']]);
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}

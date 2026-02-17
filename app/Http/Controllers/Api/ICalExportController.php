<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Response;

final class ICalExportController extends Controller
{
    public function event(Event $event): Response
    {
        $ical = $this->generateICal($event);

        return response($ical, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="event-'.$event->id.'.ics"',
        ]);
    }

    private function generateICal(Event $event): string
    {
        $start = $event->event_date->format('Ymd\THis\Z');
        $end = $event->event_date->copy()->addHours(2)->format('Ymd\THis\Z');
        $now = now()->format('Ymd\THis\Z');
        $venue = $event->venue;
        $location = $venue ? "{$venue->name}, {$venue->address}" : '';

        return "BEGIN:VCALENDAR\r\n".
            "VERSION:2.0\r\n".
            "PRODID:-//Go Event City//Events//EN\r\n".
            "BEGIN:VEVENT\r\n".
            "UID:{$event->id}@goeventcity.com\r\n".
            "DTSTAMP:{$now}\r\n".
            "DTSTART:{$start}\r\n".
            "DTEND:{$end}\r\n".
            'SUMMARY:'.$this->escapeIcal($event->title)."\r\n".
            'DESCRIPTION:'.$this->escapeIcal(strip_tags($event->description ?? ''))."\r\n".
            'LOCATION:'.$this->escapeIcal($location)."\r\n".
            'URL:'.route('events.show', $event)."\r\n".
            "END:VEVENT\r\n".
            "END:VCALENDAR\r\n";
    }

    private function escapeIcal(string $text): string
    {
        return str_replace(["\n", ',', ';'], ['\\n', '\\,', '\\;'], $text);
    }
}

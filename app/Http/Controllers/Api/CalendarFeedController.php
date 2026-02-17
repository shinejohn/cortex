<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Calendar;
use Illuminate\Http\Response;

final class CalendarFeedController extends Controller
{
    public function feed(Calendar $calendar): Response
    {
        if ($calendar->is_private) {
            abort(404);
        }

        $calendar->load(['events' => fn ($q) => $q->published()->upcoming()->orderBy('event_date')]);
        $ical = $this->generateICal($calendar);

        return response($ical, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'inline; filename="calendar-'.$calendar->id.'.ics"',
        ]);
    }

    private function generateICal(Calendar $calendar): string
    {
        $now = now()->format('Ymd\THis\Z');
        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Go Event City//Calendars//EN',
            'X-WR-CALNAME:'.$this->escapeIcal($calendar->title),
        ];

        foreach ($calendar->events as $event) {
            $start = $event->event_date->format('Ymd\THis\Z');
            $end = $event->event_date->copy()->addHours(2)->format('Ymd\THis\Z');
            $venue = $event->venue;
            $location = $venue ? "{$venue->name}, {$venue->address}" : '';

            $lines[] = 'BEGIN:VEVENT';
            $lines[] = "UID:{$event->id}@calendar-{$calendar->id}.goeventcity.com";
            $lines[] = "DTSTAMP:{$now}";
            $lines[] = "DTSTART:{$start}";
            $lines[] = "DTEND:{$end}";
            $lines[] = 'SUMMARY:'.$this->escapeIcal($event->title);
            $lines[] = 'DESCRIPTION:'.$this->escapeIcal(strip_tags($event->description ?? ''));
            $lines[] = 'LOCATION:'.$this->escapeIcal($location);
            $lines[] = 'URL:'.route('events.show', $event);
            $lines[] = 'END:VEVENT';
        }

        $lines[] = 'END:VCALENDAR';

        return implode("\r\n", $lines)."\r\n";
    }

    private function escapeIcal(string $text): string
    {
        return str_replace(["\n", ',', ';'], ['\\n', '\\,', '\\;'], $text);
    }
}

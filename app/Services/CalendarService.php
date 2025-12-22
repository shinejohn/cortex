<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

final class CalendarService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Get calendars
     */
    public function getCalendars(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = 'calendars:'.md5(serialize([$filters, $perPage]));
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($filters, $perPage) {
            $query = Calendar::with(['user', 'events']);

            // Filters
            if (isset($filters['user_id'])) {
                $query->where('user_id', $filters['user_id']);
            }

            if (isset($filters['is_private'])) {
                $query->where('is_private', $filters['is_private']);
            } else {
                // Default to public calendars
                $query->public();
            }

            if (isset($filters['category'])) {
                $query->where('category', $filters['category']);
            }

            if (isset($filters['is_verified'])) {
                $query->where('is_verified', $filters['is_verified']);
            }

            // Sorting
            $sortBy = $filters['sort_by'] ?? 'created_at';
            $sortOrder = $filters['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            return $query->paginate($perPage);
        });
    }

    /**
     * Get public calendars
     */
    public function getPublicCalendars(int $limit = 20): Collection
    {
        $cacheKey = "calendars:public:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(30), function () use ($limit) {
            return Calendar::public()
                ->verified()
                ->with(['user'])
                ->orderBy('followers_count', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get calendar events
     */
    public function getEvents(Calendar|string $calendar, array $filters = []): Collection
    {
        $calendarId = $calendar instanceof Calendar ? $calendar->id : $calendar;
        $cacheKey = "calendar:events:{$calendarId}:".md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($calendarId, $filters) {
            $calendar = Calendar::with('events')->findOrFail($calendarId);
            $events = $calendar->events;

            // Apply filters
            if (isset($filters['date_from'])) {
                $events = $events->filter(function ($event) use ($filters) {
                    return $event->event_date >= $filters['date_from'];
                });
            }

            if (isset($filters['date_to'])) {
                $events = $events->filter(function ($event) use ($filters) {
                    return $event->event_date <= $filters['date_to'];
                });
            }

            if (isset($filters['category'])) {
                $events = $events->filter(function ($event) use ($filters) {
                    return $event->category === $filters['category'];
                });
            }

            return $events->values();
        });
    }

    /**
     * Add event to calendar
     */
    public function addEvent(Calendar $calendar, Event $event, ?User $addedBy = null): void
    {
        // Check if event already in calendar
        if ($calendar->events()->where('event_id', $event->id)->exists()) {
            return;
        }

        // Get current max position
        $maxPosition = $calendar->events()->max('calendar_events.position') ?? 0;

        $calendar->events()->attach($event->id, [
            'added_by' => $addedBy?->id,
            'position' => $maxPosition + 1,
        ]);

        // Update events count
        $calendar->increment('events_count');

        // Clear cache
        $this->clearCalendarCache($calendar);
    }

    /**
     * Remove event from calendar
     */
    public function removeEvent(Calendar $calendar, Event $event): void
    {
        $calendar->events()->detach($event->id);

        // Update events count
        $calendar->decrement('events_count');

        // Clear cache
        $this->clearCalendarCache($calendar);
    }

    /**
     * Reorder calendar events
     */
    public function reorderEvents(Calendar $calendar, array $eventIds): void
    {
        foreach ($eventIds as $position => $eventId) {
            $calendar->events()->updateExistingPivot($eventId, [
                'position' => $position + 1,
            ]);
        }

        // Clear cache
        $this->clearCalendarCache($calendar);
    }

    /**
     * Follow calendar
     */
    public function followCalendar(Calendar $calendar, User $user): void
    {
        if (!$calendar->followers()->where('user_id', $user->id)->exists()) {
            $calendar->followers()->attach($user->id);
            $calendar->increment('followers_count');
            $this->clearCalendarCache($calendar);
        }
    }

    /**
     * Unfollow calendar
     */
    public function unfollowCalendar(Calendar $calendar, User $user): void
    {
        if ($calendar->followers()->where('user_id', $user->id)->exists()) {
            $calendar->followers()->detach($user->id);
            $calendar->decrement('followers_count');
            $this->clearCalendarCache($calendar);
        }
    }

    /**
     * Get user calendars
     */
    public function getUserCalendars(User|string $user): Collection
    {
        $userId = $user instanceof User ? $user->id : $user;
        $cacheKey = "calendars:user:{$userId}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($userId) {
            return Calendar::where('user_id', $userId)
                ->with(['events', 'followers'])
                ->orderBy('created_at', 'desc')
                ->get();
        });
    }

    /**
     * Clear calendar-related cache
     */
    private function clearCalendarCache(Calendar $calendar): void
    {
        $this->cacheService->forget('calendars:*');
        $this->cacheService->forget("calendar:events:{$calendar->id}:*");
        $this->cacheService->forget("calendars:user:{$calendar->user_id}");
    }
}


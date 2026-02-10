<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Event;
use App\Models\Performer;
use App\Models\Region;
use App\Models\Venue;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Schema;

final class EventService
{
    public function __construct(
        private readonly CacheService $cacheService,
        private readonly WeatherService $weatherService
    ) {}

    /**
     * Get upcoming events
     */
    public function getUpcoming(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        if (! Schema::hasTable('events')) {
            return new LengthAwarePaginator([], 0, $perPage);
        }

        $cacheKey = 'events:upcoming:'.md5(serialize([$filters, $perPage]));

        return $this->cacheService->remember($cacheKey, 300, function () use ($filters, $perPage) {
            if (! Schema::hasTable('events')) {
                return new LengthAwarePaginator([], 0, $perPage);
            }

            try {
                $query = Event::published()
                    ->upcoming()
                    ->with(['venue', 'performer', 'regions']);

                // Filters
                if (isset($filters['category'])) {
                    $query->where('category', $filters['category']);
                }

                if (isset($filters['region_id'])) {
                    $query->whereHas('regions', function ($q) use ($filters) {
                        $q->where('regions.id', $filters['region_id']);
                    });
                }

                if (isset($filters['venue_id'])) {
                    $query->where('venue_id', $filters['venue_id']);
                }

                if (isset($filters['performer_id'])) {
                    $query->where('performer_id', $filters['performer_id']);
                }

                if (isset($filters['is_free'])) {
                    $query->where('is_free', $filters['is_free']);
                }

                if (isset($filters['search'])) {
                    $search = $filters['search'];
                    $query->where(function ($q) use ($search) {
                        $q->where('title', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
                }

                if (isset($filters['date_from'])) {
                    $query->where('event_date', '>=', $filters['date_from']);
                }

                if (isset($filters['date_to'])) {
                    $query->where('event_date', '<=', $filters['date_to']);
                }

                // Location filter
                if (isset($filters['latitude'], $filters['longitude'], $filters['radius'])) {
                    $query->withinRadius(
                        (float) $filters['latitude'],
                        (float) $filters['longitude'],
                        (float) $filters['radius']
                    );
                }

                // Sorting
                $sortBy = $filters['sort_by'] ?? 'event_date';
                $sortOrder = $filters['sort_order'] ?? 'asc';

                if ($sortBy === 'distance' && isset($filters['latitude'], $filters['longitude'])) {
                    $query->orderBy('distance', $sortOrder);
                } else {
                    $query->orderBy($sortBy, $sortOrder);
                }

                return $query->paginate($perPage);
            } catch (Exception $e) {
                return new LengthAwarePaginator([], 0, $perPage);
            }
        });
    }

    /**
     * Get events by category
     */
    public function getByCategory(string $category, int $limit = 20): Collection
    {
        if (! Schema::hasTable('events')) {
            return collect();
        }

        $cacheKey = "events:category:{$category}:limit:{$limit}";

        return $this->cacheService->remember($cacheKey, 600, function () use ($category, $limit) {
            if (! Schema::hasTable('events')) {
                return collect();
            }

            try {
                return Event::published()
                    ->upcoming()
                    ->where('category', $category)
                    ->with(['venue', 'performer', 'regions'])
                    ->orderBy('event_date', 'asc')
                    ->limit($limit)
                    ->get();
            } catch (Exception $e) {
                return collect();
            }
        });
    }

    /**
     * Get events by venue
     */
    public function getByVenue(Venue|string $venue, int $limit = 20): Collection
    {
        if (! Schema::hasTable('events')) {
            return collect();
        }

        $venueId = $venue instanceof Venue ? $venue->id : $venue;
        $cacheKey = "events:venue:{$venueId}:limit:{$limit}";

        return $this->cacheService->remember($cacheKey, 600, function () use ($venueId, $limit) {
            if (! Schema::hasTable('events')) {
                return collect();
            }

            try {
                return Event::published()
                    ->upcoming()
                    ->where('venue_id', $venueId)
                    ->with(['performer', 'regions'])
                    ->orderBy('event_date', 'asc')
                    ->limit($limit)
                    ->get();
            } catch (Exception $e) {
                return collect();
            }
        });
    }

    /**
     * Get events by performer
     */
    public function getByPerformer(Performer|string $performer, int $limit = 20): Collection
    {
        if (! Schema::hasTable('events')) {
            return collect();
        }

        $performerId = $performer instanceof Performer ? $performer->id : $performer;
        $cacheKey = "events:performer:{$performerId}:limit:{$limit}";

        return $this->cacheService->remember($cacheKey, 600, function () use ($performerId, $limit) {
            if (! Schema::hasTable('events')) {
                return collect();
            }

            try {
                return Event::published()
                    ->upcoming()
                    ->where('performer_id', $performerId)
                    ->with(['venue', 'regions'])
                    ->orderBy('event_date', 'asc')
                    ->limit($limit)
                    ->get();
            } catch (Exception $e) {
                return collect();
            }
        });
    }

    /**
     * Get related events
     */
    public function getRelated(Event $event, int $limit = 6): Collection
    {
        if (! Schema::hasTable('events')) {
            return collect();
        }

        $cacheKey = "events:related:{$event->id}:limit:{$limit}";

        return $this->cacheService->remember($cacheKey, 1800, function () use ($event, $limit) {
            if (! Schema::hasTable('events')) {
                return collect();
            }

            try {
                $query = Event::published()
                    ->upcoming()
                    ->where('id', '!=', $event->id)
                    ->with(['venue', 'performer', 'regions']);

                // Find events with same category
                if ($event->category) {
                    $query->where('category', $event->category);
                }

                // Find events in same regions
                if ($event->regions->isNotEmpty()) {
                    $regionIds = $event->regions->pluck('id');
                    $query->whereHas('regions', function ($q) use ($regionIds) {
                        $q->whereIn('regions.id', $regionIds);
                    });
                }

                // Find events at same venue
                if ($event->venue_id) {
                    $query->orWhere('venue_id', $event->venue_id);
                }

                return $query->orderBy('event_date', 'asc')
                    ->limit($limit)
                    ->get();
            } catch (Exception $e) {
                return collect();
            }
        });
    }

    /**
     * Get featured events
     */
    public function getFeatured(int $limit = 6): Collection
    {
        if (! Schema::hasTable('events')) {
            return collect();
        }

        $cacheKey = "events:featured:limit:{$limit}";

        return $this->cacheService->remember($cacheKey, 1800, function () use ($limit) {
            if (! Schema::hasTable('events')) {
                return collect();
            }

            try {
                return Event::published()
                    ->upcoming()
                    ->whereNotNull('image')
                    ->with(['venue', 'performer', 'regions'])
                    ->orderBy('event_date', 'asc')
                    ->limit($limit)
                    ->get();
            } catch (Exception $e) {
                return collect();
            }
        });
    }

    /**
     * Get events by region
     */
    public function getByRegion(Region|string $region, int $limit = 20): Collection
    {
        if (! Schema::hasTable('events')) {
            return collect();
        }

        $regionId = $region instanceof Region ? $region->id : $region;
        $cacheKey = "events:region:{$regionId}:limit:{$limit}";

        return $this->cacheService->remember($cacheKey, 600, function () use ($regionId, $limit) {
            if (! Schema::hasTable('events')) {
                return collect();
            }

            try {
                return Event::published()
                    ->upcoming()
                    ->whereHas('regions', function ($q) use ($regionId) {
                        $q->where('regions.id', $regionId);
                    })
                    ->with(['venue', 'performer'])
                    ->orderBy('event_date', 'asc')
                    ->limit($limit)
                    ->get();
            } catch (Exception $e) {
                return collect();
            }
        });
    }

    /**
     * Get event with weather
     */
    public function getEventWithWeather(Event $event): array
    {
        $weather = null;

        if ($event->latitude && $event->longitude) {
            $weather = $this->weatherService->getWeatherForEvent($event);
        }

        return [
            'event' => $event->load(['venue', 'performer', 'regions']),
            'weather' => $weather,
        ];
    }

    /**
     * Clear event-related cache
     */
    public function clearCache(?Event $event = null): void
    {
        $this->cacheService->forget('events:*');

        if ($event) {
            $this->cacheService->forget("events:related:{$event->id}:*");

            if ($event->category) {
                $this->cacheService->forget("events:category:{$event->category}:*");
            }

            if ($event->venue_id) {
                $this->cacheService->forget("events:venue:{$event->venue_id}:*");
            }

            if ($event->performer_id) {
                $this->cacheService->forget("events:performer:{$event->performer_id}:*");
            }

            foreach ($event->regions as $region) {
                $this->cacheService->forget("events:region:{$region->id}:*");
            }
        }
    }
}

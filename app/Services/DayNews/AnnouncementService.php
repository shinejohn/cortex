<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\Announcement;
use App\Models\Region;

final class AnnouncementService
{
    /**
     * Get announcements by type with pagination
     */
    public function getByType(string $type, ?Region $region = null, int $perPage = 20)
    {
        $query = Announcement::published()
            ->byType($type)
            ->with(['user', 'regions'])
            ->orderBy('published_at', 'desc');

        if ($region) {
            $query->forRegion($region->id);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get featured announcements
     */
    public function getFeatured(?Region $region = null, int $limit = 5)
    {
        $query = Announcement::published()
            ->orderBy('reactions_count', 'desc')
            ->orderBy('views_count', 'desc')
            ->with(['user', 'regions']);

        if ($region) {
            $query->forRegion($region->id);
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get upcoming announcements (with event dates)
     */
    public function getUpcoming(?Region $region = null, int $limit = 10)
    {
        $query = Announcement::published()
            ->upcoming()
            ->whereNotNull('event_date')
            ->orderBy('event_date', 'asc')
            ->with(['user', 'regions']);

        if ($region) {
            $query->forRegion($region->id);
        }

        return $query->limit($limit)->get();
    }
}


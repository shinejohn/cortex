<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\DayNewsPost;
use App\Models\Region;
use Illuminate\Support\Facades\DB;

final class ArchiveService
{
    /**
     * Get archive statistics
     */
    public function getArchiveStats(?Region $region = null): array
    {
        $query = DayNewsPost::published();

        if ($region) {
            $query->whereHas('regions', function ($q) use ($region) {
                $q->where('region_id', $region->id);
            });
        }

        $totalArticles = $query->count();
        $earliestDate = $query->min('published_at');
        $mostActiveDay = $query->selectRaw('DATE(published_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('count', 'desc')
            ->first();

        $popularTopics = DayNewsPost::published()
            ->when($region, function ($q) use ($region) {
                $q->whereHas('regions', function ($regionQuery) use ($region) {
                    $regionQuery->where('region_id', $region->id);
                });
            })
            ->selectRaw('category, COUNT(*) as count')
            ->whereNotNull('category')
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($item) => [
                'name' => ucfirst(str_replace('_', ' ', $item->category)),
                'count' => $item->count,
            ]);

        return [
            'total_articles' => $totalArticles,
            'earliest_date' => $earliestDate?->toDateString(),
            'most_active_day' => $mostActiveDay ? [
                'date' => $mostActiveDay->date,
                'count' => $mostActiveDay->count,
            ] : null,
            'popular_topics' => $popularTopics,
        ];
    }

    /**
     * Get articles by date range
     */
    public function getArticlesByDateRange(?string $startDate, ?string $endDate, ?Region $region = null, int $perPage = 20)
    {
        $query = DayNewsPost::published()
            ->with(['author', 'regions'])
            ->orderBy('published_at', 'desc');

        if ($startDate) {
            $query->whereDate('published_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('published_at', '<=', $endDate);
        }

        if ($region) {
            $query->whereHas('regions', function ($q) use ($region) {
                $q->where('region_id', $region->id);
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Get articles by specific date
     */
    public function getArticlesByDate(string $date, ?Region $region = null)
    {
        $query = DayNewsPost::published()
            ->whereDate('published_at', $date)
            ->with(['author', 'regions'])
            ->orderBy('published_at', 'desc');

        if ($region) {
            $query->whereHas('regions', function ($q) use ($region) {
                $q->where('region_id', $region->id);
            });
        }

        return $query->get();
    }

    /**
     * Get calendar data (articles per day)
     */
    public function getCalendarData(int $year, int $month, ?Region $region = null): array
    {
        $query = DayNewsPost::published()
            ->whereYear('published_at', $year)
            ->whereMonth('published_at', $month)
            ->selectRaw('DATE(published_at) as date, COUNT(*) as count')
            ->groupBy('date');

        if ($region) {
            $query->whereHas('regions', function ($q) use ($region) {
                $q->where('region_id', $region->id);
            });
        }

        return $query->get()
            ->keyBy('date')
            ->map(fn ($item) => $item->count)
            ->toArray();
    }

    /**
     * Search archive
     */
    public function searchArchive(string $query, ?string $startDate = null, ?string $endDate = null, array $categories = [], ?Region $region = null, int $perPage = 20)
    {
        $searchQuery = DayNewsPost::published()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('content', 'like', "%{$query}%")
                    ->orWhere('excerpt', 'like', "%{$query}%");
            })
            ->with(['author', 'regions'])
            ->orderBy('published_at', 'desc');

        if ($startDate) {
            $searchQuery->whereDate('published_at', '>=', $startDate);
        }

        if ($endDate) {
            $searchQuery->whereDate('published_at', '<=', $endDate);
        }

        if (!empty($categories)) {
            $searchQuery->whereIn('category', $categories);
        }

        if ($region) {
            $searchQuery->whereHas('regions', function ($q) use ($region) {
                $q->where('region_id', $region->id);
            });
        }

        return $searchQuery->paginate($perPage);
    }
}


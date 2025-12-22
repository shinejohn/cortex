<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Services\DayNews\ArchiveService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ArchiveController extends Controller
{
    public function __construct(
        private readonly ArchiveService $archiveService
    ) {}

    /**
     * Display archive browser
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $view = $request->get('view', 'timeline'); // timeline, calendar, search
        $date = $request->get('date');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $search = $request->get('search');
        $categories = $request->get('categories', []);

        $stats = $this->archiveService->getArchiveStats($currentRegion);

        $articles = collect();

        if ($date) {
            $articles = $this->archiveService->getArticlesByDate($date, $currentRegion);
        } elseif ($startDate || $endDate || $search || !empty($categories)) {
            $articles = $this->archiveService->searchArchive(
                $search ?? '',
                $startDate,
                $endDate,
                $categories,
                $currentRegion
            );
        }

        // Get calendar data for current month
        $now = now();
        $calendarData = $this->archiveService->getCalendarData($now->year, $now->month, $currentRegion);

        return Inertia::render('day-news/archive/index', [
            'stats' => $stats,
            'articles' => $articles,
            'calendarData' => $calendarData,
            'filters' => [
                'view' => $view,
                'date' => $date,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search' => $search,
                'categories' => $categories,
            ],
            'currentRegion' => $currentRegion,
            'currentMonth' => $now->month,
            'currentYear' => $now->year,
        ]);
    }

    /**
     * Get calendar data for specific month/year
     */
    public function calendar(Request $request, int $year, int $month): \Illuminate\Http\JsonResponse
    {
        $currentRegion = $request->attributes->get('detected_region');
        $calendarData = $this->archiveService->getCalendarData($year, $month, $currentRegion);

        return response()->json($calendarData);
    }
}


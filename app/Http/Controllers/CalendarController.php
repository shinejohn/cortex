// ... existing code ...

    public function publicIndex(Request $request): Response
    {
        $viewMode = $request->query('view', 'list');
        $selectedDate = $request->query('date') ? new \DateTime($request->query('date')) : new \DateTime();
        
        $query = Event::published()
            ->upcoming()
            ->with(['venue', 'performer']);

        // Filter by date based on view mode
        if ($viewMode === 'today') {
            $query->whereDate('event_date', $selectedDate->format('Y-m-d'));
        } elseif ($viewMode === '7days') {
            $endDate = clone $selectedDate;
            $endDate->modify('+7 days');
            $query->whereBetween('event_date', [$selectedDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        } elseif ($viewMode === 'month') {
            $startDate = clone $selectedDate;
            $startDate->modify('first day of this month');
            $endDate = clone $selectedDate;
            $endDate->modify('last day of this month');
            $query->whereBetween('event_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        }

        $events = $query->orderBy('event_date', 'asc')->get();

        return Inertia::render('event-city/calendar/index', [
            'events' => $events,
            'selectedDate' => $selectedDate->format('Y-m-d'),
            'viewMode' => $viewMode,
        ]);
    }

// ... existing code ...

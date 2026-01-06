<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreCalendarRequest;
use App\Http\Resources\Api\V1\CalendarResource;
use App\Models\Calendar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CalendarController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Calendar::query()->with(['user'])->public();

        $calendars = $query->orderBy('title')->paginate($request->get('per_page', 20));

        return $this->paginated($calendars);
    }

    public function show(Calendar $calendar): JsonResponse
    {
        return $this->success(new CalendarResource($calendar->load(['user', 'events'])));
    }

    public function store(StoreCalendarRequest $request): JsonResponse
    {
        $calendar = Calendar::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return $this->success(new CalendarResource($calendar), 'Calendar created successfully', 201);
    }

    public function events(Request $request, Calendar $calendar): JsonResponse
    {
        $events = $calendar->events()->orderBy('event_date')->paginate($request->get('per_page', 20));
        return $this->paginated($events);
    }

    public function follow(Request $request, Calendar $calendar): JsonResponse
    {
        $calendar->followers()->syncWithoutDetaching([$request->user()->id]);
        return $this->success(null, 'Following calendar');
    }
}



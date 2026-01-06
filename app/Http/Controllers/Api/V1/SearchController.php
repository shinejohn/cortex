<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SearchController extends BaseController
{
    public function search(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:2']]);
        $query = $request->q;
        $type = $request->get('type', 'all');

        $results = [];

        if ($type === 'all' || $type === 'posts') {
            $results['posts'] = \App\Models\DayNewsPost::where('title', 'like', "%{$query}%")
                ->published()
                ->limit(10)
                ->get()
                ->map(fn($post) => ['id' => $post->id, 'title' => $post->title, 'type' => 'post']);
        }

        if ($type === 'all' || $type === 'events') {
            $results['events'] = \App\Models\Event::where('title', 'like', "%{$query}%")
                ->where('event_date', '>=', now())
                ->limit(10)
                ->get()
                ->map(fn($event) => ['id' => $event->id, 'title' => $event->title, 'type' => 'event']);
        }

        if ($type === 'all' || $type === 'businesses') {
            $results['businesses'] = \App\Models\Business::where('name', 'like', "%{$query}%")
                ->limit(10)
                ->get()
                ->map(fn($business) => ['id' => $business->id, 'name' => $business->name, 'type' => 'business']);
        }

        return $this->success($results);
    }
}



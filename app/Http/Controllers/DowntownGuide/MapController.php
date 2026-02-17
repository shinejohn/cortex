<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class MapController extends Controller
{
    /**
     * Display the map page.
     */
    public function index(Request $request): Response
    {
        // Fetch active businesses with location data
        $businesses = Business::query()
            ->active()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select([
                'id',
                'name',
                'slug',
                'latitude',
                'longitude',
                'address',
                'city',
                'categories',
                'rating',
                'reviews_count',
                'images', // For thumbnail
            ])
            ->get();

        return Inertia::render('downtown-guide/map/index', [
            'businesses' => $businesses,
        ]);
    }
}

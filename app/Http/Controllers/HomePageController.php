<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class HomePageController extends Controller
{
    public function index()
    {
        $featuredEvents = [
            [
                'id' => '1',
                'title' => 'Summer Music Festival',
                'date' => 'July 15, 2024',
                'venue' => 'Central Park Amphitheater',
                'price' => '$45',
                'category' => 'Music',
                'image' => 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop',
            ],
            [
                'id' => '2',
                'title' => 'Tech Innovation Conference',
                'date' => 'August 22, 2024',
                'venue' => 'Convention Center Downtown',
                'price' => '$120',
                'category' => 'Technology',
                'image' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
            ],
            [
                'id' => '3',
                'title' => 'Local Art Exhibition',
                'date' => 'September 5, 2024',
                'venue' => 'Gallery District',
                'price' => 'Free',
                'category' => 'Art',
                'image' => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            ],
            [
                'id' => '4',
                'title' => 'Food & Wine Tasting',
                'date' => 'October 12, 2024',
                'venue' => 'Riverside Plaza',
                'price' => '$85',
                'category' => 'Food',
                'image' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
            ],
        ];

        return Inertia::render('welcome', [
            'featuredEvents' => $featuredEvents,
        ]);
    }
}

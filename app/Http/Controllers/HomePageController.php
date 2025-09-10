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

        $featuredVenues = [
            [
                'id' => '1',
                'name' => 'Central Park Amphitheater',
                'location' => 'New York, NY',
                'capacity' => '5,000',
                'venueType' => 'Outdoor',
                'rating' => '4.8',
                'reviewCount' => '342',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
            ],
            [
                'id' => '2',
                'name' => 'Convention Center Downtown',
                'location' => 'Chicago, IL',
                'capacity' => '12,000',
                'venueType' => 'Convention Center',
                'rating' => '4.6',
                'reviewCount' => '789',
                'image' => 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
            ],
            [
                'id' => '3',
                'name' => 'Gallery District',
                'location' => 'Los Angeles, CA',
                'capacity' => '800',
                'venueType' => 'Gallery',
                'rating' => '4.9',
                'reviewCount' => '156',
                'image' => 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop',
            ],
            [
                'id' => '4',
                'name' => 'Riverside Plaza',
                'location' => 'Austin, TX',
                'capacity' => '2,500',
                'venueType' => 'Plaza',
                'rating' => '4.7',
                'reviewCount' => '423',
                'image' => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
            ],
        ];

        $featuredPerformers = [
            [
                'id' => '1',
                'name' => 'The Electric Hearts',
                'homeCity' => 'Nashville, TN',
                'genres' => ['Rock', 'Alternative'],
                'rating' => '4.9',
                'reviewCount' => '267',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => 'July 20, 2024',
                    'venue' => 'Madison Square Garden',
                ],
            ],
            [
                'id' => '2',
                'name' => 'Jazz Collective',
                'homeCity' => 'New Orleans, LA',
                'genres' => ['Jazz', 'Blues'],
                'rating' => '4.8',
                'reviewCount' => '189',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => 'August 15, 2024',
                    'venue' => 'Blue Note',
                ],
            ],
            [
                'id' => '3',
                'name' => 'Symphony Orchestra',
                'homeCity' => 'Boston, MA',
                'genres' => ['Classical', 'Symphony'],
                'rating' => '5.0',
                'reviewCount' => '445',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => 'September 10, 2024',
                    'venue' => 'Symphony Hall',
                ],
            ],
            [
                'id' => '4',
                'name' => 'DJ Marcus',
                'homeCity' => 'Miami, FL',
                'genres' => ['Electronic', 'House'],
                'rating' => '4.7',
                'reviewCount' => '312',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => 'October 5, 2024',
                    'venue' => 'Club Paradise',
                ],
            ],
        ];

        return Inertia::render('welcome', [
            'featuredEvents' => $featuredEvents,
            'featuredVenues' => $featuredVenues,
            'featuredPerformers' => $featuredPerformers,
        ]);
    }
}

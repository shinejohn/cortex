<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

final class PerformersController extends Controller
{
    public function index(): Response
    {
        // Mock data for now - in production this would come from database
        $featuredPerformers = [
            [
                'id' => '1',
                'name' => 'The Sunset Vibes',
                'homeCity' => 'Austin, TX',
                'genres' => ['Indie Rock', 'Alternative'],
                'rating' => '4.8',
                'reviewCount' => '42',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => '2024-08-15T20:00:00Z',
                    'venue' => 'Capitol Theatre',
                ],
            ],
            [
                'id' => '2',
                'name' => 'Maya Rodriguez',
                'homeCity' => 'Nashville, TN',
                'genres' => ['Folk', 'Acoustic', 'Singer-Songwriter'],
                'rating' => '4.9',
                'reviewCount' => '28',
                'image' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => '2024-08-16T19:30:00Z',
                    'venue' => 'Blue Note Cafe',
                ],
            ],
            [
                'id' => '3',
                'name' => 'Electric Pulse',
                'homeCity' => 'Los Angeles, CA',
                'genres' => ['Electronic', 'House', 'Techno'],
                'rating' => '4.7',
                'reviewCount' => '65',
                'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => '2024-08-17T22:00:00Z',
                    'venue' => 'Warehouse District',
                ],
            ],
            [
                'id' => '4',
                'name' => 'Jazz Collective',
                'homeCity' => 'New Orleans, LA',
                'genres' => ['Jazz', 'Blues', 'Soul'],
                'rating' => '4.9',
                'reviewCount' => '91',
                'image' => 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => '2024-08-18T20:30:00Z',
                    'venue' => 'French Quarter Club',
                ],
            ],
            [
                'id' => '5',
                'name' => 'Acoustic Dreams',
                'homeCity' => 'Portland, OR',
                'genres' => ['Acoustic', 'Indie Folk'],
                'rating' => '4.6',
                'reviewCount' => '33',
                'image' => 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => '2024-08-19T19:00:00Z',
                    'venue' => 'Coffee House Stage',
                ],
            ],
            [
                'id' => '6',
                'name' => 'Rock Revolution',
                'homeCity' => 'Denver, CO',
                'genres' => ['Rock', 'Alternative Rock'],
                'rating' => '4.8',
                'reviewCount' => '57',
                'image' => 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => '2024-08-20T21:00:00Z',
                    'venue' => 'Red Rocks Venue',
                ],
            ],
        ];

        $performerCategories = [
            [
                'id' => 'bands',
                'name' => 'Bands',
                'icon' => 'music',
                'count' => 45,
                'color' => 'purple',
            ],
            [
                'id' => 'solo-artists',
                'name' => 'Solo Artists',
                'icon' => 'mic',
                'count' => 32,
                'color' => 'blue',
            ],
            [
                'id' => 'djs',
                'name' => 'DJs',
                'icon' => 'headphones',
                'count' => 28,
                'color' => 'green',
            ],
            [
                'id' => 'acoustic',
                'name' => 'Acoustic',
                'icon' => 'guitar',
                'count' => 19,
                'color' => 'orange',
            ],
        ];

        return Inertia::render('performers', [
            'featuredPerformers' => $featuredPerformers,
            'performerCategories' => $performerCategories,
        ]);
    }
}

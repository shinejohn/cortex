<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Google Analytics 4 Configuration
    |--------------------------------------------------------------------------
    |
    | Each application has its own GA4 property for separate tracking.
    | Add your measurement IDs (G-XXXXXXXXXX) to your .env file.
    |
    */

    'ga4' => [
        'event-city' => env('VITE_GA4_GOEVENTCITY_ID'),
        'day-news' => env('VITE_GA4_DAYNEWS_ID'),
        'downtown-guide' => env('VITE_GA4_DOWNTOWNGUIDE_ID'),
    ],

];

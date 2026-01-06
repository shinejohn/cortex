<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Multi-App Domain Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration file defines the domains for each application in the
    | multi-app setup. Update these values in your .env file to match your
    | environment (local, staging, production).
    |
    */

    'event-city' => env('GOEVENTCITY_DOMAIN', 'goeventcity.test'),
    'day-news' => env('DAYNEWS_DOMAIN', 'daynews.test'),
    'downtown-guide' => env('DOWNTOWNGUIDE_DOMAIN', 'downtownguide.test'),
    'local-voices' => env('LOCAL_VOICES_DOMAIN', 'golocalvoices.com'),
    'alphasite' => env('ALPHASITE_DOMAIN', 'alphasite.com'),

];

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

    'event-city' => env('GOEVENTCITY_DOMAIN', parse_url(env('APP_URL', 'http://goeventcity.test'), PHP_URL_HOST)),
    'day-news' => env('DAYNEWS_DOMAIN', parse_url(env('APP_URL', 'http://daynews.test'), PHP_URL_HOST)),
    'downtown-guide' => env('DOWNTOWNGUIDE_DOMAIN', parse_url(env('APP_URL', 'http://downtownguide.test'), PHP_URL_HOST)),
    'local-voices' => env('LOCAL_VOICES_DOMAIN', parse_url(env('APP_URL', 'http://golocalvoices.com'), PHP_URL_HOST)),
    'alphasite' => env('ALPHASITE_DOMAIN', parse_url(env('APP_URL', 'http://alphasite.com'), PHP_URL_HOST)),
    'api' => env('API_DOMAIN', 'api.day.news'),

];

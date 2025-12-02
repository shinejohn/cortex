<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Sitemap Cache TTL
    |--------------------------------------------------------------------------
    |
    | The number of seconds to cache the sitemap. Default is 6 hours (21600).
    | Set to 0 to disable caching.
    |
    */

    'cache_ttl' => (int) env('SITEMAP_CACHE_TTL', 21600),

    /*
    |--------------------------------------------------------------------------
    | Sitemap URLs Per Page
    |--------------------------------------------------------------------------
    |
    | The maximum number of URLs per sitemap file. Google recommends a
    | maximum of 50,000 URLs per sitemap. When content exceeds this limit,
    | paginated sitemaps will be generated automatically.
    |
    */

    'per_page' => (int) env('SITEMAP_PER_PAGE', 50000),

];

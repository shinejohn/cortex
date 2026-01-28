<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Civic Sources Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for civic platform integrations (CivicPlus, Legistar, Nixle).
    | These sources provide government meetings, agendas, alerts, and legislation.
    |
    */

    'enabled' => env('CIVIC_SOURCES_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Collection Settings
    |--------------------------------------------------------------------------
    */
    'collection' => [
        // Maximum items to collect per source per run
        'max_items_per_source' => env('CIVIC_MAX_ITEMS_PER_SOURCE', 100),

        // Days to look back for content
        'lookback_days' => env('CIVIC_LOOKBACK_DAYS', 14),

        // Days to look ahead for events/meetings
        'lookahead_days' => env('CIVIC_LOOKAHEAD_DAYS', 30),

        // Process items into NewsArticles automatically
        'auto_process_items' => env('CIVIC_AUTO_PROCESS_ITEMS', true),

        // Maximum items to process per run
        'max_process_per_run' => env('CIVIC_MAX_PROCESS_PER_RUN', 50),
    ],

    /*
    |--------------------------------------------------------------------------
    | Platform-Specific Settings
    |--------------------------------------------------------------------------
    */
    'platforms' => [
        'legistar' => [
            'enabled' => env('CIVIC_LEGISTAR_ENABLED', true),
            'api_base_url' => 'https://webapi.legistar.com/v1',
            'default_poll_interval' => 120, // minutes
            'max_results_per_call' => 100,
            'request_timeout' => 30, // seconds

            // Content types to collect
            'collect_events' => true,      // Meetings
            'collect_matters' => true,     // Legislation
            'collect_event_items' => false, // Individual agenda items (verbose)

            // Known clients (city => client_name)
            // Add more as you discover them
            'known_clients' => [
                'New York' => 'nyc',
                'Seattle' => 'seattle',
                'Chicago' => 'chicago',
                'Los Angeles' => 'losangeles',
                'San Francisco' => 'sanfrancisco',
                'Boston' => 'boston',
                'Philadelphia' => 'philadelphiapa',
                'Denver' => 'denvergov',
                'Austin' => 'austin',
                'Portland' => 'portland',
                'Tampa' => 'tampa',
                'Orlando' => 'orlando',
                'Miami' => 'miami',
                'Atlanta' => 'atlanta',
            ],
        ],

        'civicplus' => [
            'enabled' => env('CIVIC_CIVICPLUS_ENABLED', true),
            'default_poll_interval' => 60, // minutes
            'request_timeout' => 30, // seconds

            // RSS feed types to collect
            'feed_types' => [
                'agenda' => true,
                'alert' => true,
                'calendar' => true,
                'news' => true,
                'jobs' => false, // Usually not newsworthy
            ],

            // Auto-discover feeds when adding source
            'auto_discover_feeds' => true,
        ],

        'nixle' => [
            'enabled' => env('CIVIC_NIXLE_ENABLED', true),
            'base_url' => 'https://local.nixle.com',
            'rss_base_url' => 'https://rss.nixle.com',
            'default_poll_interval' => 30, // minutes (alerts are time-sensitive)
            'request_timeout' => 30, // seconds

            // Alert types to collect
            'alert_types' => [
                'alert' => true,     // High priority
                'advisory' => true,  // Medium priority
                'community' => true, // Low priority
            ],

            // Scrape full alert details (slower but more complete)
            'scrape_details' => true,
        ],

        'granicus_media' => [
            'enabled' => env('CIVIC_GRANICUS_MEDIA_ENABLED', true),
            'default_poll_interval' => 120, // minutes
            'request_timeout' => 30, // seconds

            // Publisher discovery
            'max_view_id_probe' => 50, // Probe view_id 1-50
            'probe_delay_ms' => 100,   // Delay between probes

            // RSS URL patterns to try for each view_id
            'rss_patterns' => [
                '/xml/MediaRSS.php?view_id={view_id}',
                '/xml/MediaRSS.php?publish_id={view_id}',
                '/boards/rss/{view_id}',
                '/boards/RSS?view_id={view_id}',
                '/feeds/{view_id}',
                '/rss/{view_id}',
            ],

            // Content types
            'content_types' => [
                'meeting' => true,
                'agenda' => true,
                'minutes' => true,
                'video' => true,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Perplexity AI Discovery Settings
    |--------------------------------------------------------------------------
    |
    | Use Perplexity Sonar API for intelligent discovery of civic sources
    | at scale (city, county, or state-wide).
    |
    */
    'perplexity' => [
        'enabled' => env('CIVIC_PERPLEXITY_ENABLED', false),
        'api_key' => env('PERPLEXITY_API_KEY', ''),
        'model' => env('PERPLEXITY_MODEL', 'sonar'), // 'sonar' or 'sonar-pro'
        'request_timeout' => 60, // seconds

        // Rate limiting
        'delay_between_cities_ms' => 1000, // 1 second between city queries
        'cache_ttl_hours' => 24, // Cache discovery results

        // Cost control
        'max_cities_per_batch' => 50,
    ],

    /*
    |--------------------------------------------------------------------------
    | Content Processing
    |--------------------------------------------------------------------------
    */
    'processing' => [
        // Minimum title length to process
        'min_title_length' => 10,

        // Skip meetings that have already occurred
        'skip_past_meetings' => true,

        // Skip expired alerts
        'skip_expired_alerts' => true,

        // Priority boost for alerts
        'alert_priority_boost' => 20,

        // Priority boost for upcoming meetings (within X days)
        'upcoming_meeting_days' => 7,
        'upcoming_meeting_priority_boost' => 10,

        // Categories that should always be processed
        'always_process_categories' => [
            'public_safety',
            'emergency',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Source Health Management
    |--------------------------------------------------------------------------
    */
    'health' => [
        // Initial health score for new sources
        'initial_score' => 100,

        // Points to add after successful collection
        'success_bonus' => 5,

        // Points to subtract per failure (multiplied by consecutive failures)
        'failure_penalty' => 10,

        // Minimum health score before disabling source
        'disable_threshold' => 0,

        // Maximum consecutive failures before disabling
        'max_consecutive_failures' => 10,

        // Health score threshold for "healthy" sources
        'healthy_threshold' => 50,
    ],

    /*
    |--------------------------------------------------------------------------
    | Scheduling
    |--------------------------------------------------------------------------
    */
    'scheduling' => [
        // Run civic collection as part of main news workflow
        'integrate_with_news_workflow' => env('CIVIC_INTEGRATE_WORKFLOW', true),

        // Or run independently on this schedule (cron expression)
        'independent_schedule' => env('CIVIC_SCHEDULE', '0 */2 * * *'), // Every 2 hours

        // Process pending items on this schedule
        'processing_schedule' => env('CIVIC_PROCESSING_SCHEDULE', '30 * * * *'), // 30 min past each hour
    ],

    /*
    |--------------------------------------------------------------------------
    | Discovery Settings
    |--------------------------------------------------------------------------
    */
    'discovery' => [
        // Automatically discover sources for new regions
        'auto_discover' => env('CIVIC_AUTO_DISCOVER', true),

        // Common municipal URL patterns to try
        'municipal_url_patterns' => [
            'https://www.{city}.gov',
            'https://www.{city}{state}.gov',
            'https://www.cityof{city}.com',
            'https://www.cityof{city}.org',
            'https://{city}.gov',
        ],
    ],
];

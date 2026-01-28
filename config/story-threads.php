<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Story Threads Enabled
    |--------------------------------------------------------------------------
    */
    'enabled' => env('STORY_THREADS_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | AI Analysis
    |--------------------------------------------------------------------------
    */
    'ai' => [
        'enabled' => env('STORY_AI_ENABLED', true),
        'model' => env('STORY_AI_MODEL', 'anthropic/claude-3-sonnet'),
        'max_tokens' => 2000,
        'temperature' => 0.3,
    ],

    /*
    |--------------------------------------------------------------------------
    | Engagement Scoring
    |--------------------------------------------------------------------------
    */
    'engagement' => [
        'weights' => [
            'views' => 0.20,
            'likes' => 0.25,
            'shares' => 0.30,
            'comments' => 0.25,
        ],
        'default_thresholds' => [
            'views' => 100,
            'likes' => 10,
            'shares' => 5,
            'comments' => 5,
            'engagement_score' => 75.0,
        ],
        'high_engagement_threshold' => 80.0,
        'recalculate_interval' => 6,
    ],

    /*
    |--------------------------------------------------------------------------
    | Thread Management
    |--------------------------------------------------------------------------
    */
    'threads' => [
        'stale_days' => 7,
        'dormant_days' => 14,
        'archive_after_days' => 90,
        'match_threshold' => 0.60,
    ],

    /*
    |--------------------------------------------------------------------------
    | Follow-Up Triggers
    |--------------------------------------------------------------------------
    */
    'triggers' => [
        'time_based' => [
            'default_check_days' => [
                'critical' => 1,
                'high' => 2,
                'medium' => 3,
                'low' => 7,
            ],
            'max_checks' => 30,
            'expires_after_days' => 90,
        ],
        'date_event' => [
            'reminder_days_before' => 1,
            'expires_after_days' => 7,
            'max_checks' => 3,
        ],
        'resolution_check' => [
            'check_interval_days' => 3,
            'max_checks' => 60,
            'expires_after_days' => 180,
        ],
        'engagement_threshold' => [
            'score_threshold' => 80,
            'check_interval_days' => 1,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Priority Configuration
    |--------------------------------------------------------------------------
    */
    'priority' => [
        'critical_categories' => ['missing_person', 'amber_alert', 'emergency'],
        'high_categories' => ['crime', 'legal', 'public_safety'],
        'medium_categories' => ['politics', 'government', 'business', 'economy'],
        'category_scores' => [
            'crime' => 15,
            'emergency' => 20,
            'politics' => 10,
            'government' => 10,
            'business' => 8,
            'community' => 5,
            'sports' => 3,
            'entertainment' => 3,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Processing Schedule
    |--------------------------------------------------------------------------
    */
    'schedule' => [
        'triggers_interval_hours' => 6,
        'high_engagement_interval_hours' => 2,
        'engagement_scores_interval_hours' => 6,
        'thresholds_recalculate_day' => 'sunday',
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Configuration
    |--------------------------------------------------------------------------
    */
    'queue' => [
        'connection' => env('STORY_QUEUE_CONNECTION', 'redis'),
        'queue_name' => env('STORY_QUEUE_NAME', 'story-followup'),
    ],
];

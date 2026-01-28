<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Platform Identifier
    |--------------------------------------------------------------------------
    |
    | Used to identify this system in logs and cross-platform queries.
    | Options: daynews, taskjuggler, opscenter
    |
    */
    'platform' => env('AI_TOOLS_PLATFORM', 'unknown'),

    /*
    |--------------------------------------------------------------------------
    | Default AI Model
    |--------------------------------------------------------------------------
    |
    | provider => model pair for local agent execution
    |
    */
    'default_model' => [
        env('AI_TOOLS_PROVIDER', 'openrouter'),
        env('AI_TOOLS_MODEL', 'anthropic/claude-3-sonnet'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Execution Timeout
    |--------------------------------------------------------------------------
    |
    | Max seconds for AI tool execution
    |
    */
    'timeout' => 120,

    /*
    |--------------------------------------------------------------------------
    | Database Access Controls
    |--------------------------------------------------------------------------
    |
    | Whitelist of tables available to infrastructure tools
    |
    */
    'tables' => [
        'allowed' => [
            'users',
            'regions',
            // Application specific tables added in app config
        ],

        'writable' => [
            // Dangerous operations whitelist
        ],

        'excluded_columns' => [
            'password',
            'remember_token',
            'api_token',
            'stripe_id',
            'secret',
            'two_factor_secret',
            'two_factor_recovery_codes',
        ],

        'searchable' => [
            'users' => ['name', 'email'],
        ],
    ],
];

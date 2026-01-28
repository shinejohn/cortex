<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Gateway URL
    |--------------------------------------------------------------------------
    |
    | The centralized Gateway URL for cross-platform processing
    |
    */
    'url' => env('AI_GATEWAY_URL', 'https://ai-gateway.fibonacco.com'),

    /*
    |--------------------------------------------------------------------------
    | Gateway Authentication Token
    |--------------------------------------------------------------------------
    |
    | Secret token for authenticating effectively as an authorized platform
    |
    */
    'token' => env('AI_GATEWAY_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | Request Timeout
    |--------------------------------------------------------------------------
    |
    | Max seconds to wait for Gateway response
    |
    */
    'timeout' => 120,
];

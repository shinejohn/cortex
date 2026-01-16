<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | 4calls.ai API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for integrating with the 4calls.ai (coordinator-web) API
    | to provide AI virtual assistant services to AlphaSite businesses.
    |
    */

    'api_url' => env('FOURCALLS_API_URL', 'https://api.4calls.ai'),
    'api_key' => env('FOURCALLS_API_KEY'),
    'webhook_secret' => env('FOURCALLS_WEBHOOK_SECRET'),
    
    /*
    |--------------------------------------------------------------------------
    | Service Packages
    |--------------------------------------------------------------------------
    |
    | Define the AI service packages available for AlphaSite businesses.
    | Each package includes specific features and usage limits.
    |
    */

    'packages' => [
        'ai_receptionist' => [
            'name' => 'AI Receptionist',
            'slug' => 'ai_receptionist',
            'description' => 'Perfect for small businesses needing basic call handling and appointment scheduling.',
            'monthly_price' => env('AI_RECEPTIONIST_PRICE', 49.00),
            'features' => [
                'coordinator_count' => 1,
                'coordinator_roles' => ['receptionist'],
                'call_minutes_inbound' => 500,
                'call_minutes_outbound' => 0,
                'contact_limit' => 500,
                'appointment_scheduling' => true,
                'campaigns' => false,
                'ai_chat' => true,
                'call_analytics' => 'basic',
                'multi_channel' => false,
            ],
            'stripe_price_id' => env('STRIPE_AI_RECEPTIONIST_PRICE_ID'),
        ],

        'ai_sales' => [
            'name' => 'AI Sales Assistant',
            'slug' => 'ai_sales',
            'description' => 'Ideal for sales-focused businesses with lead qualification and follow-up automation.',
            'monthly_price' => env('AI_SALES_PRICE', 99.00),
            'features' => [
                'coordinator_count' => 1,
                'coordinator_roles' => ['sales', 'receptionist'],
                'call_minutes_inbound' => 1000,
                'call_minutes_outbound' => 500,
                'contact_limit' => null, // Unlimited
                'appointment_scheduling' => true,
                'campaigns' => true,
                'ai_chat' => true,
                'call_analytics' => 'advanced',
                'multi_channel' => false,
                'lead_qualification' => true,
            ],
            'stripe_price_id' => env('STRIPE_AI_SALES_PRICE_ID'),
        ],

        'ai_business_suite' => [
            'name' => 'AI Business Suite',
            'slug' => 'ai_business_suite',
            'description' => 'Complete CRM solution with multi-channel support and advanced analytics.',
            'monthly_price' => env('AI_BUSINESS_SUITE_PRICE', 199.00),
            'features' => [
                'coordinator_count' => 2,
                'coordinator_roles' => ['receptionist', 'sales', 'support'],
                'call_minutes_inbound' => 2000,
                'call_minutes_outbound' => 1000,
                'contact_limit' => null, // Unlimited
                'appointment_scheduling' => true,
                'campaigns' => true,
                'ai_chat' => true,
                'call_analytics' => 'advanced',
                'multi_channel' => true, // Calls, SMS, Email
                'lead_qualification' => true,
                'customer_insights' => true,
            ],
            'stripe_price_id' => env('STRIPE_AI_BUSINESS_SUITE_PRICE_ID'),
        ],

        'ai_enterprise' => [
            'name' => 'AI Enterprise',
            'slug' => 'ai_enterprise',
            'description' => 'Enterprise-grade solution with high call volume, custom integrations, and dedicated support.',
            'monthly_price' => env('AI_ENTERPRISE_PRICE', 399.00),
            'features' => [
                'coordinator_count' => 5,
                'coordinator_roles' => ['receptionist', 'sales', 'support', 'custom'],
                'call_minutes_inbound' => 5000,
                'call_minutes_outbound' => 2500,
                'contact_limit' => null, // Unlimited
                'appointment_scheduling' => true,
                'campaigns' => true,
                'ai_chat' => true,
                'call_analytics' => 'enterprise',
                'multi_channel' => true,
                'lead_qualification' => true,
                'customer_insights' => true,
                'custom_integrations' => true,
                'priority_support' => true,
                'dedicated_account_manager' => true,
                'custom_ai_training' => true,
            ],
            'stripe_price_id' => env('STRIPE_AI_ENTERPRISE_PRICE_ID'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | API Rate Limits
    |--------------------------------------------------------------------------
    |
    | Rate limits for API calls to 4calls.ai to prevent abuse and manage costs.
    |
    */

    'rate_limits' => [
        'requests_per_minute' => 60,
        'requests_per_hour' => 1000,
        'requests_per_day' => 10000,
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for receiving webhooks from 4calls.ai for real-time updates.
    |
    */

    'webhooks' => [
        'enabled' => env('FOURCALLS_WEBHOOKS_ENABLED', true),
        'endpoint' => '/api/alphasite/webhooks/fourcalls',
        'events' => [
            'call.completed',
            'call.failed',
            'appointment.created',
            'appointment.cancelled',
            'contact.created',
            'contact.updated',
            'coordinator.activated',
            'coordinator.deactivated',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Coordinator Configuration
    |--------------------------------------------------------------------------
    |
    | Default settings for Coordinators created for AlphaSite businesses.
    |
    */

    'default_coordinator' => [
        'role_template' => 'receptionist',
        'persona_template' => 'professional',
        'voice_id' => null, // Will be set based on business preference
        'custom_greeting' => null, // Will be generated from business info
        'availability' => [
            'monday' => ['09:00', '17:00'],
            'tuesday' => ['09:00', '17:00'],
            'wednesday' => ['09:00', '17:00'],
            'thursday' => ['09:00', '17:00'],
            'friday' => ['09:00', '17:00'],
            'saturday' => [],
            'sunday' => [],
        ],
    ],

];


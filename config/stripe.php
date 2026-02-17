<?php

declare(strict_types=1);

return [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

    'products' => [
        'standard' => [
            'name' => 'AlphaSite Standard',
            'price_monthly' => env('STRIPE_PRICE_STANDARD_MONTHLY'),
            'price_annual' => env('STRIPE_PRICE_STANDARD_ANNUAL'),
            'amount' => 9900, // $99/month in cents
            'ai_services' => ['concierge'],
        ],
        'premium' => [
            'name' => 'AlphaSite Premium',
            'price_monthly' => env('STRIPE_PRICE_PREMIUM_MONTHLY'),
            'price_annual' => env('STRIPE_PRICE_PREMIUM_ANNUAL'),
            'amount' => 29900, // $299/month
            'ai_services' => ['concierge', 'reservations', 'order_assistant', 'sales_agent'],
        ],
        'enterprise' => [
            'name' => 'AlphaSite Enterprise',
            'price_monthly' => env('STRIPE_PRICE_ENTERPRISE_MONTHLY'),
            'price_annual' => env('STRIPE_PRICE_ENTERPRISE_ANNUAL'),
            'amount' => 99900, // $999/month
            'ai_services' => ['concierge', 'reservations', 'order_assistant', 'sales_agent', 'marketing', 'customer_service', 'finance', 'operations'],
        ],
    ],

    'trial_days' => 90,
];

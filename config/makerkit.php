<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Workspace Functionality
    |--------------------------------------------------------------------------
    |
    | This option controls whether the workspace functionality is enabled
    | Along with additional multi-tenancy configuration.
    |
    */
    'workspaces' => [
        'enabled' => env('WORKSPACES_ENABLED', true),
        'can_create_workspaces' => env('WORKSPACES_CAN_CREATE_WORKSPACE', true),

        /*
        |--------------------------------------------------------------------------
        | Workspace Roles
        |--------------------------------------------------------------------------
        |
        | Define the roles that can be assigned to users in a workspace.
        |
        */
        'roles' => [
            'owner' => [
                'permissions' => [
                    'workspace.read',
                    'workspace.update',
                    'workspace.delete',
                    'workspace.users.manage',
                    'workspace.settings.manage',
                    'workspace.billing.manage',
                ],
            ],
            'admin' => [
                'permissions' => [
                    'workspace.read',
                    'workspace.update',
                    'workspace.users.manage',
                    'workspace.settings.manage',
                    'workspace.billing.manage',
                ],
            ],
            'member' => [
                'permissions' => [
                    'workspace.read',
                ],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Options
    |--------------------------------------------------------------------------
    |
    | Configure various authentication methods available in the application.
    |
    */
    'auth' => [
        /*
        |--------------------------------------------------------------------------
        | Magic Link Authentication
        |--------------------------------------------------------------------------
        |
        | Allow users to authenticate using a magic link.
        |
        */
        'magiclink' => [
            'enabled' => env('MAGICLINK_ENABLED', true),
        ],

        /*
        |--------------------------------------------------------------------------
        | Password Authentication
        |--------------------------------------------------------------------------
        |
        | Allow users to authenticate using a password.
        |
        */
        'password' => [
            'enabled' => env('PASSWORD_ENABLED', true),
        ],

        /*
        |--------------------------------------------------------------------------
        | Social Authentication
        |--------------------------------------------------------------------------
        |
        | Configure social authentication providers like Google, GitHub, etc.
        | Provider credentials should be defined in config/services.php.
        |
        */
        'socialite' => [
            'enabled' => env('SOCIALITE_ENABLED', true),
            'providers' => explode(',', env('SOCIALITE_PROVIDERS', 'google')),
        ],
    ],
];

<?php

return [
    'default' => 'newsroom',

    'accounts' => [
        'newsroom' => [
            'host' => env('IMAP_HOST', 'imap.gmail.com'),
            'port' => env('IMAP_PORT', 993),
            'encryption' => env('IMAP_ENCRYPTION', 'ssl'),
            'validate_cert' => env('IMAP_VALIDATE_CERT', true),
            'username' => env('IMAP_USERNAME'),
            'password' => env('IMAP_PASSWORD'),
            'protocol' => 'imap',
        ],
    ],

    'options' => [
        'delimiter' => '/',
        'fetch' => \Webklex\PHPIMAP\Support\Masks\MessageMask::class,
        'sequence' => \Webklex\PHPIMAP\Support\Masks\AttachmentMask::class,
        'fetch_order' => 'asc',
        'open' => [
            'DISABLE_AUTHENTICATOR' => 'GSSAPI',
        ],
    ],
];

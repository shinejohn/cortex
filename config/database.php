<?php

declare(strict_types=1);

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the database connections below you wish
    | to use as your default connection for database operations. This is
    | the connection which will be utilized unless another connection
    | is explicitly specified when you execute a query / statement.
    |
    */

    'default' => env('DB_CONNECTION', 'pgsql'),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | Below are all of the database connections defined for your application.
    | An example configuration is provided for each database system which
    | is supported by Laravel. You're free to add / remove connections.
    |
    */

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DB_URL', env('DATABASE_URL')),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
            'busy_timeout' => null,
            'journal_mode' => null,
            'synchronous' => null,
        ],

        'mysql' => [
            'driver' => 'mysql',
            'url' => env('DB_URL', env('DATABASE_URL')),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (defined('Pdo\Mysql::ATTR_SSL_CA') ? Pdo\Mysql::ATTR_SSL_CA : PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'mariadb' => [
            'driver' => 'mariadb',
            'url' => env('DB_URL', env('DATABASE_URL')),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (defined('Pdo\Mysql::ATTR_SSL_CA') ? Pdo\Mysql::ATTR_SSL_CA : PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', env('PGHOST', '127.0.0.1')),
            'port' => env('DB_PORT', env('PGPORT', '5432')),
            'database' => env('DB_DATABASE', env('PGDATABASE', 'laravel')),
            'username' => env('DB_USERNAME', env('PGUSER', 'root')),
            'password' => env('DB_PASSWORD', env('PGPASSWORD', '')),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => env('DB_SSLMODE', 'prefer'),
            'options' => extension_loaded('pdo_pgsql') ? array_filter([
                PDO::ATTR_TIMEOUT => env('DB_TIMEOUT', 10),
                PDO::ATTR_EMULATE_PREPARES => false,
            ]) : [],
        ],

        'sqlsrv' => [
            'driver' => 'sqlsrv',
            'url' => env('DB_URL', env('DATABASE_URL')),
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '1433'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            // 'encrypt' => env('DB_ENCRYPT', 'yes'),
            // 'trust_server_certificate' => env('DB_TRUST_SERVER_CERTIFICATE', 'false'),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | This table keeps track of all the migrations that have already run for
    | your application. Using this information, we can determine which of
    | the migrations on disk haven't actually been run on the database.
    |
    */

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | Redis is an open source, fast, and advanced key-value store that also
    | provides a richer body of commands than a typical key-value system
    | such as Memcached. You may define your connection settings here.
    |
    */

    'redis' => value(function () {
        // Parse REDIS_URL to extract components as fallbacks for Railway/cloud deployments
        $redisUrl = env('REDIS_URL');
        $parsed = $redisUrl ? parse_url($redisUrl) : [];
        $urlHost = $parsed['host'] ?? null;
        $urlPort = $parsed['port'] ?? null;
        $urlPass = isset($parsed['pass']) ? urldecode($parsed['pass']) : null;
        $urlUser = isset($parsed['user']) && $parsed['user'] !== 'default' ? $parsed['user'] : null;
        $urlDb = isset($parsed['path']) ? ltrim($parsed['path'], '/') : null;
        $urlScheme = isset($parsed['scheme']) && $parsed['scheme'] === 'rediss' ? 'tls' : 'tcp';

        $host = env('REDIS_HOST', $urlHost ?? '127.0.0.1');
        $password = env('REDIS_PASSWORD', env('REDISPASSWORD', $urlPass));
        $port = (int) env('REDIS_PORT', $urlPort ?? 6379);
        $username = env('REDIS_USERNAME', $urlUser);
        $scheme = env('REDIS_SCHEME', $urlScheme);
        $ssl = env('REDIS_TLS', false) || $scheme === 'tls' ? [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ] : [];

        return [
            // Default to predis (pure PHP, no extension needed) unless phpredis extension is explicitly configured
            // If REDIS_CLIENT is not set, we'll auto-detect in AppServiceProvider
            'client' => env('REDIS_CLIENT', 'predis'),

            'options' => [
                'cluster' => env('REDIS_CLUSTER', 'redis'),
                'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
                'persistent' => env('REDIS_PERSISTENT', false),
            ],

            'default' => [
                'url' => $redisUrl,
                'host' => $host,
                'username' => $username,
                'password' => $password,
                'port' => $port,
                'database' => env('REDIS_DB', $urlDb ?: '0'),
                'scheme' => $scheme,
                'ssl' => $ssl,
            ],

            'cache' => [
                'url' => $redisUrl,
                'host' => $host,
                'username' => $username,
                'password' => $password,
                'port' => $port,
                'database' => env('REDIS_CACHE_DB', '1'),
                'scheme' => $scheme,
                'ssl' => $ssl,
            ],
        ];
    }),

];

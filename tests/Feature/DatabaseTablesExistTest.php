<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Test to verify all database tables from migrations exist in the database.
 *
 * This test scans all migration files, extracts table names from Schema::create()
 * calls, and verifies they exist in the database. This ensures migrations have
 * been run successfully.
 */
it('verifies all tables from migrations exist in the database', function () {
    $migrationFiles = glob(database_path('migrations/*.php'));
    $expectedTables = [];
    $skippedMigrations = [];

    // Extract table names from migration files
    foreach ($migrationFiles as $file) {
        $content = file_get_contents($file);
        $filename = basename($file);

        // Skip migrations that don't create tables
        if (
            str_contains($content, 'Schema::drop') ||
            str_contains($content, 'Schema::table') ||
            str_contains($content, 'DB::table') ||
            str_contains($content, 'DB::statement') ||
            str_contains($content, 'DB::unprepared')
        ) {
            // Check if it's a pure table modification (no create)
            if (! str_contains($content, 'Schema::create')) {
                $skippedMigrations[] = $filename;

                continue;
            }
        }

        // Extract table names from Schema::create() calls
        // Pattern: Schema::create('table_name', ...) or Schema::create("table_name", ...)
        preg_match_all("/Schema::create\(['\"]([^'\"]+)['\"]/", $content, $matches);

        if (! empty($matches[1])) {
            foreach ($matches[1] as $tableName) {
                // Skip Laravel system tables that are created automatically
                if (in_array($tableName, ['migrations'])) {
                    continue;
                }

                $expectedTables[$tableName] = [
                    'migration' => $filename,
                    'table' => $tableName,
                ];
            }
        }

        // Also check for Schema::createIfNotExists
        preg_match_all("/Schema::createIfNotExists\(['\"]([^'\"]+)['\"]/", $content, $matches);
        if (! empty($matches[1])) {
            foreach ($matches[1] as $tableName) {
                if (in_array($tableName, ['migrations'])) {
                    continue;
                }
                $expectedTables[$tableName] = [
                    'migration' => $filename,
                    'table' => $tableName,
                ];
            }
        }
    }

    expect($expectedTables)->not()->toBeEmpty('No tables found in migrations');

    // Check which tables exist in the database
    $missingTables = [];
    $existingTables = [];

    foreach ($expectedTables as $tableInfo) {
        $tableName = $tableInfo['table'];

        if (Schema::hasTable($tableName)) {
            $existingTables[] = $tableName;
        } else {
            $missingTables[] = [
                'table' => $tableName,
                'migration' => $tableInfo['migration'],
            ];
        }
    }

    // Report results
    $totalTables = count($expectedTables);
    $existingCount = count($existingTables);
    $missingCount = count($missingTables);

    // Build detailed error message if tables are missing
    if ($missingCount > 0) {
        $errorMessage = "Missing {$missingCount} of {$totalTables} expected tables:\n\n";

        foreach ($missingTables as $missing) {
            $errorMessage .= "  - Table '{$missing['table']}' (from migration: {$missing['migration']})\n";
        }

        $errorMessage .= "\nRun migrations: php artisan migrate --force\n";

        fail($errorMessage);
    }

    // All tables exist
    expect($missingTables)->toBeEmpty("All {$totalTables} expected tables should exist in the database");
    expect($existingCount)->toBe($totalTables);
})->group('database');

it('verifies critical application tables exist', function () {
    $criticalTables = [
        'users',
        'workspaces',
        'events',
        'venues',
        'performers',
        'regions',
        'businesses',
        'day_news_posts',
        'article_comments',
        'tags',
        'social_posts',
        'bookings',
        'ticket_orders',
        'reviews',
        'advertisements',
    ];

    $missingCriticalTables = [];

    foreach ($criticalTables as $table) {
        if (! Schema::hasTable($table)) {
            $missingCriticalTables[] = $table;
        }
    }

    if (! empty($missingCriticalTables)) {
        $errorMessage = 'Missing critical tables: '.implode(', ', $missingCriticalTables)."\n";
        $errorMessage .= "Run migrations: php artisan migrate --force\n";
        fail($errorMessage);
    }

    expect($missingCriticalTables)->toBeEmpty('All critical tables should exist');
})->group('database');

it('can query the migrations table to verify migration status', function () {
    // Check if migrations table exists
    if (! Schema::hasTable('migrations')) {
        fail('Migrations table does not exist. Run: php artisan migrate:install');
    }

    // Get list of run migrations
    $runMigrations = DB::table('migrations')
        ->orderBy('migration')
        ->pluck('migration')
        ->toArray();

    expect($runMigrations)->not()->toBeEmpty('No migrations have been run');

    // Get list of migration files
    $migrationFiles = glob(database_path('migrations/*.php'));
    $migrationNames = array_map(function ($file) {
        return str_replace('.php', '', basename($file));
    }, $migrationFiles);

    // Find migrations that haven't been run
    $pendingMigrations = array_diff($migrationNames, $runMigrations);

    if (! empty($pendingMigrations)) {
        $errorMessage = 'Found '.count($pendingMigrations)." pending migrations:\n\n";
        foreach ($pendingMigrations as $migration) {
            $errorMessage .= "  - {$migration}\n";
        }
        $errorMessage .= "\nRun migrations: php artisan migrate --force\n";
        fail($errorMessage);
    }

    expect($pendingMigrations)->toBeEmpty('All migrations should have been run');
})->group('database');

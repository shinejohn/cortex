<?php

declare(strict_types=1);

namespace App\Console\Commands\Climactic;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

final class DiagnoseMigrationCommand extends Command
{
    protected $signature = 'climactic:diagnose-migration
        {--fix : Attempt to auto-fix the alphasite_categories migration issue}
        {--connection=pgsql : Database connection to diagnose}';

    protected $description = 'Diagnose and fix the alphasite_categories migration error on Publishing PostgreSQL';

    public function handle(): int
    {
        $connection = $this->option('connection');
        $this->info("Diagnosing migration state on [{$connection}] connection...");
        $this->newLine();

        $db = DB::connection($connection);

        // Step 1: Check migrations table
        $this->info('1. Checking migrations table...');
        $migrationRecord = $db->table('migrations')
            ->where('migration', 'like', '%create_community_linking_tables%')
            ->first();

        if ($migrationRecord) {
            $this->warn("   Migration recorded: {$migrationRecord->migration} (batch {$migrationRecord->batch})");
        } else {
            $this->info('   Migration NOT recorded in migrations table.');
        }

        // Step 2: Check which tables from the migration exist
        $this->newLine();
        $this->info('2. Checking tables created by this migration...');

        $tables = [
            'counties',
            'cities',
            'alphasite_categories',
            'city_category_content',
            'neighboring_cities',
            'business_service_areas',
        ];

        $existingTables = [];
        $missingTables = [];

        foreach ($tables as $table) {
            $exists = $db->select(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?) as exists_flag",
                [$table]
            );
            $tableExists = $exists[0]->exists_flag ?? false;

            if ($tableExists) {
                $existingTables[] = $table;
                $this->info("   ✅ {$table} exists");
            } else {
                $missingTables[] = $table;
                $this->warn("   ❌ {$table} missing");
            }
        }

        // Step 3: Check alphasite_categories constraints if it exists
        $this->newLine();
        $this->info('3. Checking alphasite_categories constraints...');

        $hasPrimaryKey = false;
        $hasSelfFk = false;

        if (in_array('alphasite_categories', $existingTables)) {
            // Check primary key
            $pkResult = $db->select("
                SELECT constraint_name, constraint_type
                FROM information_schema.table_constraints
                WHERE table_schema = 'public'
                  AND table_name = 'alphasite_categories'
                  AND constraint_type = 'PRIMARY KEY'
            ");
            $hasPrimaryKey = count($pkResult) > 0;

            if ($hasPrimaryKey) {
                $this->info("   ✅ Primary key exists: {$pkResult[0]->constraint_name}");
            } else {
                $this->error('   ❌ NO primary key on alphasite_categories');
            }

            // Check self-referencing foreign key
            $fkResult = $db->select("
                SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
                WHERE tc.table_schema = 'public'
                  AND tc.table_name = 'alphasite_categories'
                  AND tc.constraint_type = 'FOREIGN KEY'
            ");

            foreach ($fkResult as $fk) {
                if ($fk->foreign_table_name === 'alphasite_categories') {
                    $hasSelfFk = true;
                    $this->info("   ✅ Self-referencing FK exists: {$fk->constraint_name} ({$fk->column_name})");
                } else {
                    $this->info("   FK: {$fk->constraint_name} -> {$fk->foreign_table_name}");
                }
            }

            if (! $hasSelfFk) {
                $this->warn('   ⚠️ Self-referencing FK on parent_id is missing');
            }

            // Check column types
            $columns = $db->select("
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'alphasite_categories'
                ORDER BY ordinal_position
            ");
            $this->newLine();
            $this->info('   Columns:');
            foreach ($columns as $col) {
                $nullable = $col->is_nullable === 'YES' ? 'nullable' : 'not null';
                $default = $col->column_default ? " default={$col->column_default}" : '';
                $this->line("     {$col->column_name}: {$col->data_type} ({$nullable}){$default}");
            }
        }

        // Step 4: Check businesses table for city_id/category_id
        $this->newLine();
        $this->info('4. Checking businesses table for city_id/category_id columns...');

        if (in_array('businesses', $existingTables) || $db->select("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses') as exists_flag")[0]->exists_flag) {
            $cityIdExists = $db->select("
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'city_id'
                ) as exists_flag
            ");
            $categoryIdExists = $db->select("
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'category_id'
                ) as exists_flag
            ");

            $this->info('   city_id: '.($cityIdExists[0]->exists_flag ? '✅ exists' : '❌ missing'));
            $this->info('   category_id: '.($categoryIdExists[0]->exists_flag ? '✅ exists' : '❌ missing'));
        } else {
            $this->warn('   businesses table not found');
        }

        // Step 5: Check total migration count
        $this->newLine();
        $this->info('5. Migration status...');
        $totalMigrations = $db->table('migrations')->count();
        $lastBatch = $db->table('migrations')->max('batch');
        $this->info("   Total migrations run: {$totalMigrations}");
        $this->info("   Last batch: {$lastBatch}");

        // Check for pending migrations by listing recent ones
        $recentMigrations = $db->table('migrations')
            ->orderByDesc('batch')
            ->limit(10)
            ->get();
        $this->newLine();
        $this->info('   Last 10 migrations:');
        foreach ($recentMigrations as $m) {
            $this->line("     [{$m->batch}] {$m->migration}");
        }

        // Summary and fix
        $this->newLine();
        $this->info('═══════════════════════════════════════');
        $this->info('DIAGNOSIS SUMMARY');
        $this->info('═══════════════════════════════════════');

        if (empty($missingTables) && $hasPrimaryKey && $hasSelfFk) {
            $this->info('✅ Migration appears complete and healthy.');
            $this->info('   Run `php artisan migrate --force` to apply any remaining pending migrations.');

            return self::SUCCESS;
        }

        // Determine fix strategy
        if (! empty($missingTables) && in_array('alphasite_categories', $missingTables)) {
            $this->error('ISSUE: alphasite_categories table is missing.');

            if ($migrationRecord) {
                $this->warn('FIX: Migration is recorded but table is missing. Need to:');
                $this->warn('  1. Delete the migration record');
                $this->warn('  2. Re-run the migration');

                if ($this->option('fix')) {
                    $this->applyFix($db, 'missing_table_recorded', $migrationRecord);
                } else {
                    $this->info('Run with --fix to apply automatically.');
                }
            } else {
                $this->warn('FIX: Run `php artisan migrate --force` to create missing tables.');
            }
        } elseif (in_array('alphasite_categories', $existingTables) && ! $hasPrimaryKey) {
            $this->error('ISSUE: alphasite_categories exists but has no primary key.');
            $this->warn('FIX: Add primary key and self-referencing FK.');

            if ($this->option('fix')) {
                $this->applyFix($db, 'missing_pk', null);
            } else {
                $this->info('Run with --fix to apply automatically.');
            }
        } elseif (in_array('alphasite_categories', $existingTables) && $hasPrimaryKey && ! $hasSelfFk) {
            $this->warn('ISSUE: alphasite_categories exists with PK but missing self-referencing FK.');
            $this->warn('FIX: Add the foreign key constraint.');

            if ($this->option('fix')) {
                $this->applyFix($db, 'missing_fk', null);
            } else {
                $this->info('Run with --fix to apply automatically.');
            }
        } elseif (! empty($missingTables)) {
            $this->error('ISSUE: Partial migration - some tables missing: '.implode(', ', $missingTables));
            $this->warn('FIX: Drop all tables from this migration and re-run.');

            if ($this->option('fix')) {
                $this->applyFix($db, 'partial_migration', $migrationRecord);
            } else {
                $this->info('Run with --fix to apply automatically.');
            }
        }

        return self::FAILURE;
    }

    private function applyFix(\Illuminate\Database\ConnectionInterface $db, string $strategy, ?object $migrationRecord): void
    {
        $this->newLine();
        $this->warn("Applying fix strategy: {$strategy}");

        if (! $this->confirm('This will modify the database. Continue?')) {
            return;
        }

        match ($strategy) {
            'missing_table_recorded' => $this->fixMissingTableRecorded($db, $migrationRecord),
            'missing_pk' => $this->fixMissingPk($db),
            'missing_fk' => $this->fixMissingFk($db),
            'partial_migration' => $this->fixPartialMigration($db, $migrationRecord),
            default => $this->error("Unknown fix strategy: {$strategy}"),
        };
    }

    private function fixMissingTableRecorded(\Illuminate\Database\ConnectionInterface $db, object $migrationRecord): void
    {
        $this->info('Removing stale migration record...');
        $db->table('migrations')->where('id', $migrationRecord->id)->delete();
        $this->info('Done. Now run: php artisan migrate --force');
    }

    private function fixMissingPk(\Illuminate\Database\ConnectionInterface $db): void
    {
        $this->info('Adding primary key to alphasite_categories...');
        $db->statement('ALTER TABLE alphasite_categories ADD PRIMARY KEY (id)');
        $this->info('Primary key added.');

        $this->fixMissingFk($db);
    }

    private function fixMissingFk(\Illuminate\Database\ConnectionInterface $db): void
    {
        $this->info('Adding self-referencing foreign key on parent_id...');
        $db->statement('
            ALTER TABLE alphasite_categories
            ADD CONSTRAINT alphasite_categories_parent_id_foreign
            FOREIGN KEY (parent_id) REFERENCES alphasite_categories(id) ON DELETE SET NULL
        ');
        $this->info('Foreign key added.');
    }

    private function fixPartialMigration(\Illuminate\Database\ConnectionInterface $db, ?object $migrationRecord): void
    {
        $this->warn('Dropping all tables from community_linking migration...');

        // Drop in reverse dependency order
        $dropOrder = [
            'business_service_areas',
            'neighboring_cities',
            'city_category_content',
            'alphasite_categories',
            'cities',
            'counties',
        ];

        // Remove businesses columns first if they exist
        $cityIdExists = $db->select("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'city_id') as exists_flag")[0]->exists_flag;
        $categoryIdExists = $db->select("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'category_id') as exists_flag")[0]->exists_flag;

        if ($categoryIdExists) {
            $this->info('  Dropping businesses.category_id...');
            $db->statement('ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_category_id_foreign');
            $db->statement('ALTER TABLE businesses DROP COLUMN IF EXISTS category_id');
        }
        if ($cityIdExists) {
            $this->info('  Dropping businesses.city_id...');
            $db->statement('ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_city_id_foreign');
            $db->statement('ALTER TABLE businesses DROP COLUMN IF EXISTS city_id');
        }

        foreach ($dropOrder as $table) {
            $exists = $db->select("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?) as exists_flag", [$table])[0]->exists_flag;
            if ($exists) {
                $this->info("  Dropping {$table}...");
                $db->statement("DROP TABLE IF EXISTS {$table} CASCADE");
            }
        }

        // Remove migration record if it exists
        if ($migrationRecord) {
            $db->table('migrations')->where('id', $migrationRecord->id)->delete();
            $this->info('  Removed stale migration record.');
        }

        $this->info('All tables dropped. Now run: php artisan migrate --force');
    }
}

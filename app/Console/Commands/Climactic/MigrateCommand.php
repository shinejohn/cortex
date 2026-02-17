<?php

declare(strict_types=1);

namespace App\Console\Commands\Climactic;

use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

/**
 * Migrates data from Climactic PostgreSQL to Publishing PostgreSQL.
 *
 * Reads the mapping JSON produced by `climactic:analyze`, then batch-imports
 * data respecting FK dependency order (tier 0 through 5), preserving UUIDs
 * and original timestamps throughout the process.
 */
final class MigrateCommand extends Command
{
    private const SOURCE_CONNECTION = 'pgsql_climactic';

    private const TARGET_CONNECTION = 'pgsql';

    private const LOG_CHANNEL = 'climactic-migrate';

    /** @var array<string, mixed> */
    private const DEFAULT_VALUES = [
        'subscription_tier' => 'free',
        'is_active' => true,
        'status' => 'active',
    ];

    protected $signature = 'climactic:migrate
        {--dry-run : Show what would happen without importing}
        {--table= : Import only a specific table}
        {--mapping=storage/app/climactic-mapping.json : Path to mapping JSON}
        {--batch-size=500 : Rows per batch insert}
        {--skip-fk-check : Disable FK constraints during import}';

    protected $description = 'Migrate data from Climactic PostgreSQL to Publishing PostgreSQL using analyzed mapping';

    /**
     * @var array{
     *     imported: int,
     *     skipped: int,
     *     errors: int,
     *     tables_completed: list<string>
     * }
     */
    private array $stats = [
        'imported' => 0,
        'skipped' => 0,
        'errors' => 0,
        'tables_completed' => [],
    ];

    public function handle(): int
    {
        $this->configureLogging();

        $mapping = $this->loadMapping();
        if ($mapping === null) {
            return self::FAILURE;
        }

        $tables = $this->resolveTables($mapping);
        if ($tables === []) {
            $this->error('No tables to import.');

            return self::FAILURE;
        }

        $isDryRun = (bool) $this->option('dry-run');

        if ($isDryRun) {
            return $this->executeDryRun($tables, $mapping);
        }

        return $this->executeImport($tables, $mapping);
    }

    /**
     * Load and validate the mapping JSON file.
     *
     * @return array<string, mixed>|null
     */
    private function loadMapping(): ?array
    {
        $path = $this->option('mapping');

        if (! str_starts_with($path, '/')) {
            $path = base_path($path);
        }

        if (! File::exists($path)) {
            $this->error("Mapping file not found: {$path}");
            $this->logOperation('error', "Mapping file not found: {$path}");

            return null;
        }

        $content = File::get($path);
        $mapping = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON in mapping file: '.json_last_error_msg());
            $this->logOperation('error', 'Invalid JSON: '.json_last_error_msg());

            return null;
        }

        if (! isset($mapping['tables']) || ! is_array($mapping['tables'])) {
            $this->error('Mapping JSON must contain a "tables" key with table definitions.');
            $this->logOperation('error', 'Missing "tables" key in mapping JSON');

            return null;
        }

        $this->info('Mapping file loaded successfully.');
        $this->logOperation('info', "Mapping loaded from {$path}");

        return $mapping;
    }

    /**
     * Resolve which tables to import, sorted by tier order.
     *
     * @param  array<string, mixed>  $mapping
     * @return list<array{name: string, tier: int, columns: array<string, mixed>}>
     */
    private function resolveTables(array $mapping): array
    {
        $singleTable = $this->option('table');
        $tables = [];

        foreach ($mapping['tables'] as $tableName => $tableConfig) {
            if ($singleTable !== null && $tableName !== $singleTable) {
                continue;
            }

            $tables[] = [
                'name' => $tableName,
                'tier' => (int) ($tableConfig['import_tier'] ?? 0),
                'columns' => $tableConfig['columns'] ?? [],
            ];
        }

        usort($tables, fn (array $a, array $b): int => $a['tier'] <=> $b['tier']);

        return $tables;
    }

    /**
     * Show a summary of what would be imported without making changes.
     *
     * @param  list<array{name: string, tier: int, columns: array<string, mixed>}>  $tables
     * @param  array<string, mixed>  $mapping
     */
    private function executeDryRun(array $tables, array $mapping): int
    {
        $this->info('');
        $this->info('=== DRY RUN MODE ===');
        $this->info('No data will be imported.');
        $this->newLine();

        $rows = [];

        foreach ($tables as $table) {
            $tableName = $table['name'];

            try {
                $count = DB::connection(self::SOURCE_CONNECTION)
                    ->table($tableName)
                    ->count();
            } catch (Exception $e) {
                $count = 'ERROR: '.$e->getMessage();
            }

            $columnActions = $this->summarizeColumnActions($table['columns']);

            $rows[] = [
                $tableName,
                $table['tier'],
                is_int($count) ? number_format($count) : $count,
                $columnActions['direct'],
                $columnActions['new_nullable'],
                $columnActions['new_required'],
                $columnActions['removed'],
            ];
        }

        $this->table(
            ['Table', 'Tier', 'Source Rows', 'Direct', 'New Null', 'New Req', 'Removed'],
            $rows,
        );

        $this->newLine();
        $this->info('Run without --dry-run to perform the actual import.');

        return self::SUCCESS;
    }

    /**
     * Summarize column action counts for dry-run display.
     *
     * @param  array<string, mixed>  $columns
     * @return array{direct: int, new_nullable: int, new_required: int, removed: int}
     */
    private function summarizeColumnActions(array $columns): array
    {
        $summary = ['direct' => 0, 'new_nullable' => 0, 'new_required' => 0, 'removed' => 0];

        foreach ($columns as $columnConfig) {
            $action = $columnConfig['action'] ?? 'direct_match';

            match ($action) {
                'direct_match', 'type_widened' => $summary['direct']++,
                'new_nullable' => $summary['new_nullable']++,
                'new_required' => $summary['new_required']++,
                'removed' => $summary['removed']++,
                'type_changed' => $summary['direct']++,
                default => $summary['direct']++,
            };
        }

        return $summary;
    }

    /**
     * Execute the actual data import in tier order.
     *
     * @param  list<array{name: string, tier: int, columns: array<string, mixed>}>  $tables
     * @param  array<string, mixed>  $mapping
     */
    private function executeImport(array $tables, array $mapping): int
    {
        $batchSize = (int) $this->option('batch-size');
        $skipFkCheck = (bool) $this->option('skip-fk-check');
        $completedTables = $this->getCompletedTables();

        $this->info('');
        $this->info('=== Starting Climactic Data Migration ===');
        $this->logOperation('info', 'Migration started', [
            'tables' => count($tables),
            'batch_size' => $batchSize,
            'skip_fk_check' => $skipFkCheck,
        ]);

        if ($skipFkCheck) {
            $this->warn('Disabling FK constraints on target database...');
            DB::connection(self::TARGET_CONNECTION)
                ->statement("SET session_replication_role = 'replica'");
            $this->logOperation('info', 'FK constraints disabled');
        }

        try {
            foreach ($tables as $table) {
                $tableName = $table['name'];

                if (in_array($tableName, $completedTables, true)) {
                    $this->info("Skipping {$tableName} (already completed in previous run)");
                    $this->logOperation('info', "Skipped {$tableName} (already completed)");

                    continue;
                }

                $this->importTable($table, $batchSize);
            }
        } finally {
            if ($skipFkCheck) {
                $this->warn('Re-enabling FK constraints on target database...');
                DB::connection(self::TARGET_CONNECTION)
                    ->statement("SET session_replication_role = 'origin'");
                $this->logOperation('info', 'FK constraints re-enabled');
            }
        }

        $this->printSummary();

        return $this->stats['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Import a single table from source to target connection.
     *
     * @param  array{name: string, tier: int, columns: array<string, mixed>}  $table
     */
    private function importTable(array $table, int $batchSize): void
    {
        $tableName = $table['name'];
        $columns = $table['columns'];

        $this->newLine();
        $this->info("Importing [{$tableName}] (tier {$table['tier']})...");
        $this->logOperation('info', "Starting import for {$tableName}", ['tier' => $table['tier']]);

        try {
            $totalRows = DB::connection(self::SOURCE_CONNECTION)
                ->table($tableName)
                ->count();
        } catch (Exception $e) {
            $this->error("  Cannot read source table {$tableName}: {$e->getMessage()}");
            $this->logOperation('error', "Cannot read source table {$tableName}", [
                'error' => $e->getMessage(),
            ]);
            $this->stats['errors']++;

            return;
        }

        if ($totalRows === 0) {
            $this->info("  No rows to import for {$tableName}.");
            $this->logOperation('info', "No rows in {$tableName}");
            $this->markTableCompleted($tableName);

            return;
        }

        $this->info("  Source rows: {$totalRows}");

        $sourceColumns = $this->resolveSourceColumns($columns);
        $bar = $this->output->createProgressBar($totalRows);
        $bar->setFormat('  %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%');
        $bar->start();

        $tableImported = 0;
        $tableSkipped = 0;
        $tableErrors = 0;

        try {
            DB::connection(self::SOURCE_CONNECTION)
                ->table($tableName)
                ->orderBy('id')
                ->chunk($batchSize, function ($rows) use (
                    $tableName,
                    $columns,
                    $sourceColumns,
                    $bar,
                    &$tableImported,
                    &$tableSkipped,
                    &$tableErrors,
                ): void {
                    $batch = [];

                    foreach ($rows as $row) {
                        $transformed = $this->transformRow((array) $row, $columns, $sourceColumns);
                        if ($transformed !== null) {
                            $batch[] = $transformed;
                        }
                        $bar->advance();
                    }

                    if ($batch === []) {
                        return;
                    }

                    try {
                        $inserted = DB::connection(self::TARGET_CONNECTION)
                            ->table($tableName)
                            ->insertOrIgnore($batch);

                        $tableImported += $inserted;
                        $tableSkipped += count($batch) - $inserted;
                    } catch (Exception $e) {
                        $tableErrors += count($batch);
                        $this->logOperation('error', "Batch insert failed for {$tableName}", [
                            'error' => $e->getMessage(),
                            'batch_size' => count($batch),
                        ]);
                    }
                });
        } catch (Exception $e) {
            $this->error("  Fatal error importing {$tableName}: {$e->getMessage()}");
            $this->logOperation('error', "Fatal error for {$tableName}", [
                'error' => $e->getMessage(),
            ]);
            $tableErrors++;
        }

        $bar->finish();
        $this->newLine();
        $this->info("  Imported: {$tableImported} | Skipped: {$tableSkipped} | Errors: {$tableErrors}");

        $this->logOperation('info', "Completed {$tableName}", [
            'imported' => $tableImported,
            'skipped' => $tableSkipped,
            'errors' => $tableErrors,
        ]);

        $this->stats['imported'] += $tableImported;
        $this->stats['skipped'] += $tableSkipped;
        $this->stats['errors'] += $tableErrors;

        if ($tableErrors === 0) {
            $this->markTableCompleted($tableName);
        }
    }

    /**
     * Determine which columns should be read from the source table.
     *
     * @param  array<string, mixed>  $columns
     * @return list<string>
     */
    private function resolveSourceColumns(array $columns): array
    {
        $sourceColumns = [];

        foreach ($columns as $columnName => $config) {
            $action = $config['action'] ?? 'direct_match';

            if (in_array($action, ['new_nullable', 'new_required', 'removed'], true)) {
                continue;
            }

            $sourceColumn = $config['possible_source'] ?? $config['source_column'] ?? $columnName;
            $sourceColumns[] = $sourceColumn;
        }

        return $sourceColumns;
    }

    /**
     * Transform a single source row into the target schema.
     *
     * @param  array<string, mixed>  $row
     * @param  array<string, mixed>  $columns
     * @param  list<string>  $sourceColumns
     * @return array<string, mixed>|null
     */
    private function transformRow(array $row, array $columns, array $sourceColumns): ?array
    {
        $transformed = [];

        foreach ($columns as $columnName => $config) {
            $action = $config['action'] ?? 'direct_match';

            match ($action) {
                'direct_match', 'type_widened' => $this->applyDirectCopy(
                    $transformed, $row, $columnName, $config
                ),
                'new_nullable' => $transformed[$columnName] = null,
                'new_required' => $transformed[$columnName] = $this->resolveDefaultValue(
                    $columnName, $config
                ),
                'removed' => null,
                'type_changed' => $this->applyTypeTransform(
                    $transformed, $row, $columnName, $config
                ),
                default => $this->applyDirectCopy(
                    $transformed, $row, $columnName, $config
                ),
            };
        }

        return $transformed !== [] ? $transformed : null;
    }

    /**
     * Copy a value directly from source to target.
     *
     * @param  array<string, mixed>  $transformed
     * @param  array<string, mixed>  $row
     * @param  array<string, mixed>  $config
     */
    private function applyDirectCopy(array &$transformed, array $row, string $columnName, array $config): void
    {
        $sourceColumn = $config['possible_source'] ?? $config['source_column'] ?? $columnName;
        $transformed[$columnName] = $row[$sourceColumn] ?? null;
    }

    /**
     * Apply type transformation from source to target.
     *
     * @param  array<string, mixed>  $transformed
     * @param  array<string, mixed>  $row
     * @param  array<string, mixed>  $config
     */
    private function applyTypeTransform(array &$transformed, array $row, string $columnName, array $config): void
    {
        $sourceColumn = $config['possible_source'] ?? $config['source_column'] ?? $columnName;
        $value = $row[$sourceColumn] ?? null;
        $targetType = $config['target_type'] ?? null;

        if ($value === null) {
            $transformed[$columnName] = null;

            return;
        }

        $transformed[$columnName] = match ($targetType) {
            'integer', 'int', 'bigint' => (int) $value,
            'float', 'double', 'decimal', 'numeric' => (float) $value,
            'boolean', 'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'string', 'varchar', 'text' => (string) $value,
            'json', 'jsonb' => is_string($value) ? $value : json_encode($value),
            default => $value,
        };
    }

    /**
     * Resolve the default value for a new required column.
     *
     * @param  array<string, mixed>  $config
     */
    private function resolveDefaultValue(string $columnName, array $config): mixed
    {
        if (isset($config['default'])) {
            return $config['default'];
        }

        return self::DEFAULT_VALUES[$columnName] ?? null;
    }

    /**
     * Retrieve the list of tables completed in previous runs.
     *
     * @return list<string>
     */
    private function getCompletedTables(): array
    {
        $progressFile = $this->progressFilePath();

        if (! File::exists($progressFile)) {
            return [];
        }

        $content = File::get($progressFile);
        $data = json_decode($content, true);

        return is_array($data) ? ($data['completed_tables'] ?? []) : [];
    }

    /**
     * Mark a table as completed for resume support.
     */
    private function markTableCompleted(string $tableName): void
    {
        $this->stats['tables_completed'][] = $tableName;

        $progressFile = $this->progressFilePath();
        $existing = [];

        if (File::exists($progressFile)) {
            $existing = json_decode(File::get($progressFile), true) ?? [];
        }

        $completedTables = $existing['completed_tables'] ?? [];
        $completedTables[] = $tableName;

        File::put($progressFile, json_encode([
            'completed_tables' => array_values(array_unique($completedTables)),
            'last_updated' => now()->toIso8601String(),
        ], JSON_PRETTY_PRINT));
    }

    /**
     * Get the path to the progress tracking file.
     */
    private function progressFilePath(): string
    {
        return storage_path('app/climactic-migrate-progress.json');
    }

    /**
     * Print the final migration summary.
     */
    private function printSummary(): void
    {
        $this->newLine();
        $this->info('==========================================');
        $this->info('       MIGRATION SUMMARY');
        $this->info('==========================================');
        $this->info("  Rows imported:  {$this->stats['imported']}");
        $this->info("  Rows skipped:   {$this->stats['skipped']}");

        if ($this->stats['errors'] > 0) {
            $this->error("  Errors:         {$this->stats['errors']}");
        } else {
            $this->info("  Errors:         {$this->stats['errors']}");
        }

        $this->info('  Tables done:    '.count($this->stats['tables_completed']));
        $this->info('==========================================');

        $this->logOperation('info', 'Migration completed', $this->stats);
    }

    /**
     * Configure a dedicated log channel for migration operations.
     */
    private function configureLogging(): void
    {
        $logPath = storage_path('logs/climactic-migrate.log');

        config([
            'logging.channels.'.self::LOG_CHANNEL => [
                'driver' => 'single',
                'path' => $logPath,
                'level' => 'debug',
            ],
        ]);
    }

    /**
     * Log an operation to the dedicated migration log file.
     *
     * @param  array<string, mixed>  $context
     */
    private function logOperation(string $level, string $message, array $context = []): void
    {
        Log::channel(self::LOG_CHANNEL)->{$level}("[climactic:migrate] {$message}", $context);
    }
}

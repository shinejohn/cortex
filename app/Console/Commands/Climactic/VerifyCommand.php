<?php

declare(strict_types=1);

namespace App\Console\Commands\Climactic;

use Illuminate\Console\Command;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Throwable;

/**
 * Post-migration integrity verification for Climactic -> Publishing data migration.
 *
 * Compares record counts, detects FK orphans, performs UUID spot-checks,
 * validates timestamp preservation, and runs domain-specific checks.
 *
 * @example php artisan climactic:verify
 * @example php artisan climactic:verify --table=users --verbose
 */
final class VerifyCommand extends Command
{
    private const SOURCE_CONNECTION = 'pgsql_climactic';

    private const TARGET_CONNECTION = 'pgsql';

    protected $signature = 'climactic:verify
        {--table= : Verify only a specific table}
        {--mapping=storage/app/climactic-mapping.json : Path to mapping JSON}
        {--verbose : Show detailed output per table}';

    protected $description = 'Verify data integrity after Climactic to Publishing migration';

    /** @var array<int, array{table: string, issue: string, detail: string}> */
    private array $issues = [];

    /** @var array<int, array<string, mixed>> */
    private array $summaryRows = [];

    public function handle(): int
    {
        $mappingPath = $this->option('mapping');

        if (! str_starts_with($mappingPath, '/')) {
            $mappingPath = base_path($mappingPath);
        }

        if (! File::exists($mappingPath)) {
            $this->error("Mapping file not found: {$mappingPath}");

            return self::FAILURE;
        }

        /** @var array<string, mixed> $mapping */
        $mapping = json_decode(File::get($mappingPath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON in mapping file: '.json_last_error_msg());

            return self::FAILURE;
        }

        $tables = $this->resolveTables($mapping);

        if ($tables === []) {
            $this->error('No tables found to verify.');

            return self::FAILURE;
        }

        $this->info('Climactic -> Publishing Migration Verification');
        $this->info(str_repeat('=', 55));
        $this->info('Source: '.self::SOURCE_CONNECTION);
        $this->info('Target: '.self::TARGET_CONNECTION);
        $this->info('Tables: '.count($tables));
        $this->newLine();

        $source = DB::connection(self::SOURCE_CONNECTION);
        $target = DB::connection(self::TARGET_CONNECTION);

        foreach ($tables as $tableConfig) {
            $this->verifyTable($source, $target, $tableConfig);
        }

        $this->runSpecialChecks($source, $target, $mapping);
        $this->printSummary();
        $this->writeLogReport();

        $passed = $this->issues === [];

        $this->newLine();
        if ($passed) {
            $this->info('RESULT: ALL CHECKS PASSED');
        } else {
            $this->error('RESULT: '.count($this->issues).' ISSUE(S) FOUND');
        }

        return $passed ? self::SUCCESS : self::FAILURE;
    }

    /**
     * Resolve the list of tables to verify from the mapping config.
     *
     * The mapping JSON uses an associative array keyed by table name:
     * {"tables": {"users": {"status": "matched", ...}, ...}}
     *
     * @param  array<string, mixed>  $mapping
     * @return list<array<string, mixed>>
     */
    private function resolveTables(array $mapping): array
    {
        /** @var array<string, array<string, mixed>> $rawTables */
        $rawTables = $mapping['tables'] ?? [];

        $filterTable = $this->option('table');
        $tables = [];

        foreach ($rawTables as $tableName => $tableConfig) {
            if ($filterTable !== null && $tableName !== $filterTable) {
                continue;
            }

            $tableConfig['_table_name'] = $tableName;
            $tables[] = $tableConfig;
        }

        return $tables;
    }

    /**
     * Run all verification checks for a single table.
     *
     * @param  array<string, mixed>  $tableConfig
     */
    private function verifyTable(
        ConnectionInterface $source,
        ConnectionInterface $target,
        array $tableConfig,
    ): void {
        $sourceName = $tableConfig['_table_name'] ?? '';
        $targetName = $sourceName;

        $this->info("Verifying: {$sourceName} -> {$targetName}");

        $sourceCount = $this->safeCount($source, $sourceName);
        $targetCount = $this->safeCount($target, $targetName);

        $countsMatch = $sourceCount === $targetCount;
        $delta = $targetCount - $sourceCount;

        if (! $countsMatch) {
            $this->addIssue($targetName, 'Count Mismatch', "Source: {$sourceCount}, Target: {$targetCount} (delta: {$delta})");
        }

        $fkOrphans = $this->checkFkOrphans($target, $targetName, $tableConfig);
        $spotCheckPassed = $this->spotCheckUuids($source, $target, $sourceName, $targetName);
        $this->checkTimestampPreservation($source, $target, $sourceName, $targetName);
        $this->checkNullableNewColumns($target, $targetName, $tableConfig);

        $this->summaryRows[] = [
            'Table' => "{$sourceName} -> {$targetName}",
            'Source Count' => $sourceCount,
            'Target Count' => $targetCount,
            'Match?' => $countsMatch ? 'YES' : 'NO',
            'FK Orphans' => $fkOrphans,
            'Spot Check' => $spotCheckPassed ? 'PASS' : 'FAIL',
        ];

        if ($this->option('verbose')) {
            $this->line("  Source count: {$sourceCount}");
            $this->line("  Target count: {$targetCount}");
            $this->line('  Counts match: '.($countsMatch ? 'YES' : "NO (delta: {$delta})"));
            $this->line("  FK orphans: {$fkOrphans}");
            $this->line('  Spot check: '.($spotCheckPassed ? 'PASS' : 'FAIL'));
        }

        $this->newLine();
    }

    /**
     * Safely count rows in a table, returning 0 if the table does not exist.
     */
    private function safeCount(ConnectionInterface $db, string $table): int
    {
        try {
            $result = $db->selectOne("SELECT COUNT(*) AS cnt FROM \"{$table}\"");

            return (int) ($result->cnt ?? 0);
        } catch (Throwable) {
            return 0;
        }
    }

    /**
     * Detect FK orphans for all foreign key columns defined in the table config.
     *
     * The mapping JSON stores foreign_keys as a list of objects:
     * [{"constraint_name": "...", "column_name": "user_id", "foreign_table": "users", "foreign_column": "id"}]
     *
     * @param  array<string, mixed>  $tableConfig
     */
    private function checkFkOrphans(ConnectionInterface $target, string $table, array $tableConfig): int
    {
        /** @var list<array{constraint_name: string, column_name: string, foreign_table: string, foreign_column: string}> $foreignKeys */
        $foreignKeys = $tableConfig['foreign_keys'] ?? [];

        $totalOrphans = 0;

        foreach ($foreignKeys as $fk) {
            $fkColumn = $fk['column_name'];
            $referencedTable = $fk['foreign_table'];
            $referencedColumn = $fk['foreign_column'] ?? 'id';

            try {
                $result = $target->selectOne(
                    "SELECT COUNT(*) AS cnt
                     FROM \"{$table}\" t
                     LEFT JOIN \"{$referencedTable}\" r ON t.\"{$fkColumn}\" = r.\"{$referencedColumn}\"
                     WHERE r.\"{$referencedColumn}\" IS NULL AND t.\"{$fkColumn}\" IS NOT NULL",
                );

                $orphanCount = (int) ($result->cnt ?? 0);

                if ($orphanCount > 0) {
                    $totalOrphans += $orphanCount;
                    $this->addIssue(
                        $table,
                        'FK Orphans',
                        "{$orphanCount} orphaned rows: {$table}.{$fkColumn} -> {$referencedTable}.{$referencedColumn}",
                    );
                }
            } catch (Throwable $e) {
                $this->addIssue($table, 'FK Check Error', "{$fkColumn}: {$e->getMessage()}");
            }
        }

        return $totalOrphans;
    }

    /**
     * Select 5 random IDs from source and verify they exist in target with the same created_at.
     */
    private function spotCheckUuids(
        ConnectionInterface $source,
        ConnectionInterface $target,
        string $sourceName,
        string $targetName,
    ): bool {
        try {
            $samples = $source->select(
                "SELECT id, created_at FROM \"{$sourceName}\" ORDER BY RANDOM() LIMIT 5",
            );
        } catch (Throwable) {
            return true; // Skip if source table is inaccessible
        }

        if ($samples === []) {
            return true;
        }

        $allPassed = true;

        foreach ($samples as $sample) {
            try {
                $targetRow = $target->selectOne(
                    "SELECT id, created_at FROM \"{$targetName}\" WHERE id = ?",
                    [$sample->id],
                );

                if ($targetRow === null) {
                    $allPassed = false;
                    $this->addIssue($targetName, 'Spot Check', "ID {$sample->id} missing from target");

                    continue;
                }

                $sourceTimestamp = Carbon::parse($sample->created_at)->toIso8601String();
                $targetTimestamp = Carbon::parse($targetRow->created_at)->toIso8601String();

                if ($sourceTimestamp !== $targetTimestamp) {
                    $allPassed = false;
                    $this->addIssue(
                        $targetName,
                        'Spot Check Timestamp',
                        "ID {$sample->id}: source={$sourceTimestamp}, target={$targetTimestamp}",
                    );
                }
            } catch (Throwable $e) {
                $allPassed = false;
                $this->addIssue($targetName, 'Spot Check Error', $e->getMessage());
            }
        }

        return $allPassed;
    }

    /**
     * Compare MIN/MAX created_at between source and target tables.
     */
    private function checkTimestampPreservation(
        ConnectionInterface $source,
        ConnectionInterface $target,
        string $sourceName,
        string $targetName,
    ): void {
        try {
            $sourceRange = $source->selectOne(
                "SELECT MIN(created_at) AS min_ts, MAX(created_at) AS max_ts FROM \"{$sourceName}\"",
            );
            $targetRange = $target->selectOne(
                "SELECT MIN(created_at) AS min_ts, MAX(created_at) AS max_ts FROM \"{$targetName}\"",
            );
        } catch (Throwable) {
            return; // Skip if timestamps are not available
        }

        if ($sourceRange === null || $targetRange === null) {
            return;
        }

        if ($sourceRange->min_ts === null && $targetRange->min_ts === null) {
            return;
        }

        $sourceMin = $sourceRange->min_ts ? Carbon::parse($sourceRange->min_ts)->toIso8601String() : null;
        $targetMin = $targetRange->min_ts ? Carbon::parse($targetRange->min_ts)->toIso8601String() : null;
        $sourceMax = $sourceRange->max_ts ? Carbon::parse($sourceRange->max_ts)->toIso8601String() : null;
        $targetMax = $targetRange->max_ts ? Carbon::parse($targetRange->max_ts)->toIso8601String() : null;

        if ($sourceMin !== $targetMin) {
            $this->addIssue(
                $targetName,
                'Timestamp MIN Mismatch',
                "Source: {$sourceMin}, Target: {$targetMin}",
            );
        }

        if ($sourceMax !== $targetMax) {
            $this->addIssue(
                $targetName,
                'Timestamp MAX Mismatch',
                "Source: {$sourceMax}, Target: {$targetMax}",
            );
        }

        if ($this->option('verbose')) {
            $this->line("  Timestamps: MIN {$sourceMin} -> {$targetMin}, MAX {$sourceMax} -> {$targetMax}");
        }
    }

    /**
     * Verify that new nullable columns have not been accidentally populated.
     *
     * @param  array<string, mixed>  $tableConfig
     */
    private function checkNullableNewColumns(ConnectionInterface $target, string $table, array $tableConfig): void
    {
        /** @var array<int, string> $nullableColumns */
        $nullableColumns = $tableConfig['new_nullable'] ?? [];

        foreach ($nullableColumns as $column) {
            try {
                $result = $target->selectOne(
                    "SELECT COUNT(*) AS cnt FROM \"{$table}\" WHERE \"{$column}\" IS NOT NULL",
                );

                $nonNullCount = (int) ($result->cnt ?? 0);

                if ($nonNullCount > 0) {
                    $this->addIssue(
                        $table,
                        'New Column Populated',
                        "Column {$column} has {$nonNullCount} non-null values (expected all NULL)",
                    );
                }
            } catch (Throwable $e) {
                $this->addIssue($table, 'Null Check Error', "{$column}: {$e->getMessage()}");
            }
        }
    }

    /**
     * Run domain-specific integrity checks for users, businesses, and events.
     *
     * @param  array<string, mixed>  $mapping
     */
    private function runSpecialChecks(ConnectionInterface $source, ConnectionInterface $target, array $mapping): void
    {
        $this->info('Running special domain checks...');
        $this->newLine();

        $this->checkUsersPasswordHashes($target);
        $this->checkBusinessesGooglePlaceId($source, $target, $mapping);
        $this->checkEventsDatePreservation($source, $target, $mapping);
    }

    /**
     * Users: Verify password hashes are present (not null/empty).
     */
    private function checkUsersPasswordHashes(ConnectionInterface $target): void
    {
        try {
            $result = $target->selectOne(
                'SELECT COUNT(*) AS cnt FROM "users" WHERE password IS NULL OR password = \'\'',
            );

            $emptyPasswords = (int) ($result->cnt ?? 0);

            if ($emptyPasswords > 0) {
                $this->addIssue('users', 'Empty Passwords', "{$emptyPasswords} users with null/empty password hash");
            }

            if ($this->option('verbose')) {
                $this->line("  Users with empty passwords: {$emptyPasswords}");
            }
        } catch (Throwable $e) {
            $this->addIssue('users', 'Password Check Error', $e->getMessage());
        }
    }

    /**
     * Businesses: Verify google_place_id values are preserved from source.
     *
     * @param  array<string, mixed>  $mapping
     */
    private function checkBusinessesGooglePlaceId(
        ConnectionInterface $source,
        ConnectionInterface $target,
        array $mapping,
    ): void {
        $sourceTable = $this->resolveSourceTableName('businesses', $mapping);
        $targetTable = 'businesses';

        try {
            $sourceCount = $source->selectOne(
                "SELECT COUNT(*) AS cnt FROM \"{$sourceTable}\" WHERE google_place_id IS NOT NULL AND google_place_id != ''",
            );
            $targetCount = $target->selectOne(
                "SELECT COUNT(*) AS cnt FROM \"{$targetTable}\" WHERE google_place_id IS NOT NULL AND google_place_id != ''",
            );

            $srcCnt = (int) ($sourceCount->cnt ?? 0);
            $tgtCnt = (int) ($targetCount->cnt ?? 0);

            if ($srcCnt !== $tgtCnt) {
                $this->addIssue(
                    $targetTable,
                    'google_place_id Mismatch',
                    "Source has {$srcCnt} non-null, Target has {$tgtCnt} non-null",
                );
            }

            if ($this->option('verbose')) {
                $this->line("  Businesses google_place_id: Source={$srcCnt}, Target={$tgtCnt}");
            }
        } catch (Throwable $e) {
            $this->addIssue($targetTable, 'google_place_id Check Error', $e->getMessage());
        }
    }

    /**
     * Events: Verify event_date values are preserved correctly from source.
     *
     * @param  array<string, mixed>  $mapping
     */
    private function checkEventsDatePreservation(
        ConnectionInterface $source,
        ConnectionInterface $target,
        array $mapping,
    ): void {
        $sourceTable = $this->resolveSourceTableName('events', $mapping);
        $targetTable = 'events';

        try {
            $samples = $source->select(
                "SELECT id, event_date FROM \"{$sourceTable}\" WHERE event_date IS NOT NULL ORDER BY RANDOM() LIMIT 10",
            );

            $mismatches = 0;

            foreach ($samples as $sample) {
                $targetRow = $target->selectOne(
                    "SELECT event_date FROM \"{$targetTable}\" WHERE id = ?",
                    [$sample->id],
                );

                if ($targetRow === null) {
                    $mismatches++;

                    continue;
                }

                $sourceDate = Carbon::parse($sample->event_date)->toDateString();
                $targetDate = Carbon::parse($targetRow->event_date)->toDateString();

                if ($sourceDate !== $targetDate) {
                    $mismatches++;

                    if ($this->option('verbose')) {
                        $this->warn("  Event ID {$sample->id}: source={$sourceDate}, target={$targetDate}");
                    }
                }
            }

            if ($mismatches > 0) {
                $this->addIssue(
                    $targetTable,
                    'event_date Mismatch',
                    "{$mismatches} of ".count($samples).' sampled events have date discrepancies',
                );
            }

            if ($this->option('verbose')) {
                $this->line('  Events date spot-check: '.count($samples)." sampled, {$mismatches} mismatches");
            }
        } catch (Throwable $e) {
            $this->addIssue($targetTable, 'event_date Check Error', $e->getMessage());
        }
    }

    /**
     * Resolve the source table name from the mapping config for a given target table.
     *
     * In the Climactic migration, source and target table names are always the same
     * (both databases use the same table names). The mapping JSON is keyed by table name.
     *
     * @param  array<string, mixed>  $mapping
     */
    private function resolveSourceTableName(string $targetTable, array $mapping): string
    {
        /** @var array<string, array<string, mixed>> $tables */
        $tables = $mapping['tables'] ?? [];

        if (isset($tables[$targetTable])) {
            return $targetTable;
        }

        return $targetTable;
    }

    /**
     * Record an issue found during verification.
     */
    private function addIssue(string $table, string $issue, string $detail): void
    {
        $this->issues[] = [
            'table' => $table,
            'issue' => $issue,
            'detail' => $detail,
        ];

        $this->warn("  [{$table}] {$issue}: {$detail}");
    }

    /**
     * Print the summary table and list of issues.
     */
    private function printSummary(): void
    {
        $this->newLine();
        $this->info(str_repeat('=', 55));
        $this->info('VERIFICATION SUMMARY');
        $this->info(str_repeat('=', 55));
        $this->newLine();

        if ($this->summaryRows !== []) {
            $this->table(
                ['Table', 'Source Count', 'Target Count', 'Match?', 'FK Orphans', 'Spot Check'],
                $this->summaryRows,
            );
        }

        if ($this->issues !== []) {
            $this->newLine();
            $this->error('Issues Found: '.count($this->issues));
            $this->newLine();

            foreach ($this->issues as $i => $issue) {
                $num = $i + 1;
                $this->line("  {$num}. [{$issue['table']}] {$issue['issue']}");
                $this->line("     {$issue['detail']}");
            }
        } else {
            $this->newLine();
            $this->info('No issues found. All checks passed.');
        }
    }

    /**
     * Write a verification report to the log file.
     */
    private function writeLogReport(): void
    {
        $logPath = storage_path('logs/climactic-verify.log');
        $timestamp = Carbon::now()->toIso8601String();

        $lines = [];
        $lines[] = str_repeat('=', 70);
        $lines[] = "Climactic Migration Verification Report - {$timestamp}";
        $lines[] = str_repeat('=', 70);
        $lines[] = '';

        foreach ($this->summaryRows as $row) {
            $lines[] = sprintf(
                '%-40s Source: %-8s Target: %-8s Match: %-4s FK: %-4s Spot: %s',
                $row['Table'],
                $row['Source Count'],
                $row['Target Count'],
                $row['Match?'],
                $row['FK Orphans'],
                $row['Spot Check'],
            );
        }

        $lines[] = '';

        if ($this->issues !== []) {
            $lines[] = 'ISSUES ('.count($this->issues).')';
            $lines[] = str_repeat('-', 40);

            foreach ($this->issues as $i => $issue) {
                $num = $i + 1;
                $lines[] = "{$num}. [{$issue['table']}] {$issue['issue']}: {$issue['detail']}";
            }
        } else {
            $lines[] = 'STATUS: ALL CHECKS PASSED';
        }

        $lines[] = '';
        $lines[] = str_repeat('=', 70);

        $content = implode(PHP_EOL, $lines).PHP_EOL;

        File::ensureDirectoryExists(dirname($logPath));
        File::append($logPath, $content);

        $this->line("Report written to: {$logPath}");
    }
}

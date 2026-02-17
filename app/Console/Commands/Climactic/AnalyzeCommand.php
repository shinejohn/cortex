<?php

declare(strict_types=1);

namespace App\Console\Commands\Climactic;

use Illuminate\Console\Command;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

final class AnalyzeCommand extends Command
{
    /**
     * Type compatibility map: source type => list of compatible target types that count as direct match.
     *
     * @var array<string, list<string>>
     */
    private const TYPE_COMPATIBILITY = [
        'character varying' => ['text', 'character varying'],
        'varchar' => ['text', 'character varying', 'varchar'],
        'integer' => ['bigint', 'integer', 'numeric'],
        'smallint' => ['integer', 'bigint', 'smallint', 'numeric'],
        'real' => ['double precision', 'numeric', 'real'],
        'float' => ['double precision', 'numeric', 'float'],
        'timestamp without time zone' => ['timestamp with time zone', 'timestamp without time zone'],
        'boolean' => ['boolean', 'smallint'],
    ];

    /**
     * Types considered wider than their counterparts for type_widened detection.
     *
     * @var array<string, list<string>>
     */
    private const TYPE_WIDENING = [
        'text' => ['character varying', 'varchar', 'char'],
        'bigint' => ['integer', 'smallint'],
        'double precision' => ['real', 'float', 'numeric'],
        'timestamp with time zone' => ['timestamp without time zone'],
        'numeric' => ['integer', 'smallint', 'bigint', 'real', 'float'],
    ];

    /**
     * Import tier definitions: tier => list of table name patterns.
     *
     * @var array<int, list<string>>
     */
    private const IMPORT_TIERS = [
        0 => ['regions', 'tags', 'collection_methods', 'counties', 'cities', 'alphasite_categories'],
        1 => ['users', 'workspaces', 'communities', 'community_leaders'],
        2 => ['businesses', 'venues', 'performers', 'news_sources', 'creator_profiles', 'podcasts', 'calendars'],
        3 => ['events', 'day_news_posts', 'news_articles', 'podcast_episodes', 'classifieds', 'announcements', 'memorials', 'check_ins', 'raw_content'],
        4 => ['ticket_orders', 'ticket_order_items', 'advertisements', 'ad_campaigns', 'ad_impressions', 'promo_codes', 'quote_requests'],
        5 => [], // Catch-all for pivot/junction tables
    ];

    protected $signature = 'climactic:analyze
        {--output=storage/app/climactic-mapping.json : Path to save mapping JSON}';

    protected $description = 'Compare schemas between Publishing and Climactic PostgreSQL databases to prepare for data migration';

    public function handle(): int
    {
        $this->info('Climactic Schema Analysis');
        $this->info('Comparing Publishing (pgsql) vs Climactic (pgsql_climactic)...');
        $this->newLine();

        $publishing = DB::connection('pgsql');
        $climactic = DB::connection('pgsql_climactic');

        $pubSchema = $this->introspectDatabase($publishing, 'Publishing');
        $climSchema = $this->introspectDatabase($climactic, 'Climactic');

        $pubForeignKeys = $this->introspectForeignKeys($publishing);
        $climForeignKeys = $this->introspectForeignKeys($climactic);

        $comparison = $this->compareSchemas($pubSchema, $climSchema, $pubForeignKeys);
        $this->renderReport($comparison, $pubSchema, $climSchema);

        $mapping = $this->buildMappingJson($comparison, $pubSchema, $climSchema, $pubForeignKeys);
        $this->writeMapping($mapping);

        return self::SUCCESS;
    }

    /**
     * Introspect all tables and columns from a database connection.
     *
     * @return array<string, array<string, array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}>>
     */
    private function introspectDatabase(ConnectionInterface $db, string $label): array
    {
        $this->info("Introspecting {$label} database...");

        $tables = $db->select("
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
        ");

        $schema = [];

        foreach ($tables as $table) {
            $tableName = $table->table_name;

            $columns = $db->select("
                SELECT column_name, data_type, is_nullable, column_default, ordinal_position
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = ?
                ORDER BY ordinal_position
            ", [$tableName]);

            $schema[$tableName] = [];

            foreach ($columns as $col) {
                $schema[$tableName][$col->column_name] = [
                    'data_type' => $col->data_type,
                    'is_nullable' => $col->is_nullable,
                    'column_default' => $col->column_default,
                    'ordinal_position' => (int) $col->ordinal_position,
                ];
            }
        }

        $this->line('  Found '.count($schema).' tables');

        return $schema;
    }

    /**
     * Introspect foreign key constraints from a database connection.
     *
     * @return array<string, list<array{constraint_name: string, column_name: string, foreign_table: string, foreign_column: string}>>
     */
    private function introspectForeignKeys(ConnectionInterface $db): array
    {
        $fks = $db->select("
            SELECT
                tc.table_name,
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = 'public'
            ORDER BY tc.table_name, kcu.column_name
        ");

        $result = [];

        foreach ($fks as $fk) {
            $result[$fk->table_name][] = [
                'constraint_name' => $fk->constraint_name,
                'column_name' => $fk->column_name,
                'foreign_table' => $fk->foreign_table_name,
                'foreign_column' => $fk->foreign_column_name,
            ];
        }

        return $result;
    }

    /**
     * Compare two schemas and classify each table and column.
     *
     * @param  array<string, array<string, array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}>>  $pubSchema
     * @param  array<string, array<string, array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}>>  $climSchema
     * @param  array<string, list<array{constraint_name: string, column_name: string, foreign_table: string, foreign_column: string}>>  $pubForeignKeys
     * @return array<string, array{status: string, columns: array<string, array{action: string, source_type?: string, target_type?: string, default?: mixed, note?: string}>}>
     */
    private function compareSchemas(array $pubSchema, array $climSchema, array $pubForeignKeys): array
    {
        $comparison = [];

        $allTables = array_unique(array_merge(array_keys($pubSchema), array_keys($climSchema)));
        sort($allTables);

        foreach ($allTables as $table) {
            $inPublishing = isset($pubSchema[$table]);
            $inClimactic = isset($climSchema[$table]);

            if ($inPublishing && $inClimactic) {
                $comparison[$table] = [
                    'status' => 'matched',
                    'columns' => $this->compareColumns(
                        $pubSchema[$table],
                        $climSchema[$table]
                    ),
                ];
            } elseif ($inPublishing && ! $inClimactic) {
                $comparison[$table] = [
                    'status' => 'new_in_publishing',
                    'columns' => $this->mapNewTableColumns($pubSchema[$table]),
                ];
            } else {
                $comparison[$table] = [
                    'status' => 'removed_from_publishing',
                    'columns' => $this->mapRemovedTableColumns($climSchema[$table]),
                ];
            }
        }

        return $comparison;
    }

    /**
     * Compare columns between Publishing and Climactic for a matched table.
     *
     * @param  array<string, array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}>  $pubColumns
     * @param  array<string, array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}>  $climColumns
     * @return array<string, array{action: string, source_type?: string, target_type?: string, default?: mixed, note?: string}>
     */
    private function compareColumns(array $pubColumns, array $climColumns): array
    {
        $result = [];

        $allColumns = array_unique(array_merge(array_keys($pubColumns), array_keys($climColumns)));
        sort($allColumns);

        $climOnlyColumns = array_diff(array_keys($climColumns), array_keys($pubColumns));
        $pubOnlyColumns = array_diff(array_keys($pubColumns), array_keys($climColumns));

        foreach ($allColumns as $column) {
            $inPub = isset($pubColumns[$column]);
            $inClim = isset($climColumns[$column]);

            if ($inPub && $inClim) {
                $result[$column] = $this->classifyMatchedColumn(
                    $column,
                    $pubColumns[$column],
                    $climColumns[$column]
                );
            } elseif ($inPub && ! $inClim) {
                $renamed = $this->detectPotentialRename($column, $pubColumns[$column], $climOnlyColumns, $climColumns);

                if ($renamed !== null) {
                    $result[$column] = $renamed;
                } elseif ($pubColumns[$column]['is_nullable'] === 'YES') {
                    $result[$column] = [
                        'action' => 'new_nullable',
                        'target_type' => $pubColumns[$column]['data_type'],
                        'default' => null,
                    ];
                } else {
                    $result[$column] = [
                        'action' => 'new_required',
                        'target_type' => $pubColumns[$column]['data_type'],
                        'default' => $this->suggestDefault($pubColumns[$column]),
                        'note' => 'Needs default value or data transformation',
                    ];
                }
            } else {
                $result[$column] = [
                    'action' => 'removed',
                    'source_type' => $climColumns[$column]['data_type'],
                    'note' => 'Column only in Climactic; archive to metadata or skip',
                ];
            }
        }

        return $result;
    }

    /**
     * Classify a column that exists in both databases.
     *
     * @param  array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}  $pubCol
     * @param  array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}  $climCol
     * @return array{action: string, source_type: string, target_type: string, note?: string}
     */
    private function classifyMatchedColumn(string $columnName, array $pubCol, array $climCol): array
    {
        $pubType = $pubCol['data_type'];
        $climType = $climCol['data_type'];

        if ($pubType === $climType) {
            return [
                'action' => 'direct_match',
                'source_type' => $climType,
                'target_type' => $pubType,
            ];
        }

        if ($this->isCompatibleType($climType, $pubType)) {
            return [
                'action' => 'direct_match',
                'source_type' => $climType,
                'target_type' => $pubType,
                'note' => "Compatible types: {$climType} -> {$pubType}",
            ];
        }

        if ($this->isTypeWidened($pubType, $climType)) {
            return [
                'action' => 'type_widened',
                'source_type' => $climType,
                'target_type' => $pubType,
                'note' => "Publishing has broader type: {$climType} -> {$pubType}",
            ];
        }

        return [
            'action' => 'type_changed',
            'source_type' => $climType,
            'target_type' => $pubType,
            'note' => "Incompatible type change: {$climType} -> {$pubType}; needs transform",
        ];
    }

    /**
     * Check if source type is compatible with target type.
     */
    private function isCompatibleType(string $sourceType, string $targetType): bool
    {
        $compatible = self::TYPE_COMPATIBILITY[$sourceType] ?? [];

        return in_array($targetType, $compatible, true);
    }

    /**
     * Check if target type is a widening of source type.
     */
    private function isTypeWidened(string $targetType, string $sourceType): bool
    {
        $widens = self::TYPE_WIDENING[$targetType] ?? [];

        return in_array($sourceType, $widens, true);
    }

    /**
     * Detect potential column renames by matching type and ordinal proximity.
     *
     * @param  array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}  $pubCol
     * @param  list<string>  $climOnlyColumns
     * @param  array<string, array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}>  $climColumns
     * @return ?array{action: string, target_type: string, source_type: string, possible_source: string, note: string}
     */
    private function detectPotentialRename(string $pubColumn, array $pubCol, array $climOnlyColumns, array $climColumns): ?array
    {
        $candidates = [];

        foreach ($climOnlyColumns as $climColumn) {
            if (! isset($climColumns[$climColumn])) {
                continue;
            }

            $climCol = $climColumns[$climColumn];

            $typeMatch = $pubCol['data_type'] === $climCol['data_type']
                || $this->isCompatibleType($climCol['data_type'], $pubCol['data_type']);

            if (! $typeMatch) {
                continue;
            }

            $positionDelta = abs($pubCol['ordinal_position'] - $climCol['ordinal_position']);

            if ($positionDelta <= 3) {
                $candidates[] = [
                    'column' => $climColumn,
                    'delta' => $positionDelta,
                ];
            }
        }

        if (count($candidates) === 0) {
            return null;
        }

        usort($candidates, fn (array $a, array $b): int => $a['delta'] <=> $b['delta']);
        $best = $candidates[0];

        return [
            'action' => 'renamed',
            'target_type' => $pubCol['data_type'],
            'source_type' => $climColumns[$best['column']]['data_type'],
            'possible_source' => $best['column'],
            'note' => "Possible rename from '{$best['column']}'; same type, position delta {$best['delta']}. Needs manual review.",
        ];
    }

    /**
     * Suggest a sensible default for a required column without source data.
     *
     * @param  array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}  $column
     */
    private function suggestDefault(array $column): mixed
    {
        if ($column['column_default'] !== null) {
            return $column['column_default'];
        }

        return match ($column['data_type']) {
            'integer', 'bigint', 'smallint' => 0,
            'boolean' => false,
            'text', 'character varying', 'varchar' => '',
            'jsonb', 'json' => '{}',
            'timestamp with time zone', 'timestamp without time zone' => 'now()',
            'uuid' => 'gen_random_uuid()',
            'numeric', 'double precision', 'real' => 0,
            default => null,
        };
    }

    /**
     * Map all columns of a new-in-Publishing table as new_nullable or new_required.
     *
     * @param  array<string, array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}>  $columns
     * @return array<string, array{action: string, target_type: string, default?: mixed}>
     */
    private function mapNewTableColumns(array $columns): array
    {
        $result = [];

        foreach ($columns as $name => $col) {
            if ($col['is_nullable'] === 'YES' || $col['column_default'] !== null) {
                $result[$name] = [
                    'action' => 'new_nullable',
                    'target_type' => $col['data_type'],
                    'default' => $col['column_default'],
                ];
            } else {
                $result[$name] = [
                    'action' => 'new_required',
                    'target_type' => $col['data_type'],
                    'default' => $this->suggestDefault($col),
                ];
            }
        }

        return $result;
    }

    /**
     * Map all columns of a removed (Climactic-only) table.
     *
     * @param  array<string, array{data_type: string, is_nullable: string, column_default: ?string, ordinal_position: int}>  $columns
     * @return array<string, array{action: string, source_type: string, note: string}>
     */
    private function mapRemovedTableColumns(array $columns): array
    {
        $result = [];

        foreach ($columns as $name => $col) {
            $result[$name] = [
                'action' => 'removed',
                'source_type' => $col['data_type'],
                'note' => 'Table only in Climactic; archive or skip',
            ];
        }

        return $result;
    }

    /**
     * Determine the import tier for a given table based on FK dependencies.
     *
     * @param  array<string, list<array{constraint_name: string, column_name: string, foreign_table: string, foreign_column: string}>>  $foreignKeys
     */
    private function resolveImportTier(string $table, array $foreignKeys): int
    {
        foreach (self::IMPORT_TIERS as $tier => $tables) {
            if (in_array($table, $tables, true)) {
                return $tier;
            }
        }

        $tableFks = $foreignKeys[$table] ?? [];

        if (count($tableFks) === 0) {
            return 0;
        }

        $isPivot = $this->isPivotTable($table, $tableFks);
        if ($isPivot) {
            return 5;
        }

        return 3;
    }

    /**
     * Heuristic to detect pivot/junction tables: typically have two+ FK columns and few non-FK columns.
     *
     * @param  list<array{constraint_name: string, column_name: string, foreign_table: string, foreign_column: string}>  $tableFks
     */
    private function isPivotTable(string $table, array $tableFks): bool
    {
        if (count($tableFks) < 2) {
            return false;
        }

        if (str_contains($table, '_pivot') || str_contains($table, '_has_') || str_contains($table, 'ables')) {
            return true;
        }

        $parts = explode('_', $table);
        if (count($parts) >= 2 && ! str_starts_with($table, 'user_') && count($tableFks) >= 2) {
            $fkColumns = array_column($tableFks, 'column_name');
            $fkRatio = count($fkColumns) / max(count($parts), 1);
            if ($fkRatio >= 0.8) {
                return true;
            }
        }

        return false;
    }

    /**
     * Compute a topological import order from FK dependencies.
     *
     * @param  array<string, array{status: string, columns: array}>  $comparison
     * @param  array<string, list<array{constraint_name: string, column_name: string, foreign_table: string, foreign_column: string}>>  $foreignKeys
     * @return list<string>
     */
    private function computeImportOrder(array $comparison, array $foreignKeys): array
    {
        $tables = array_keys($comparison);
        $tierMap = [];

        foreach ($tables as $table) {
            $tierMap[$table] = $this->resolveImportTier($table, $foreignKeys);
        }

        usort($tables, function (string $a, string $b) use ($tierMap): int {
            $tierDiff = $tierMap[$a] <=> $tierMap[$b];
            if ($tierDiff !== 0) {
                return $tierDiff;
            }

            return $a <=> $b;
        });

        return $tables;
    }

    /**
     * Render a human-readable report to the console.
     *
     * @param  array<string, array{status: string, columns: array}>  $comparison
     * @param  array<string, array<string, array>>  $pubSchema
     * @param  array<string, array<string, array>>  $climSchema
     */
    private function renderReport(array $comparison, array $pubSchema, array $climSchema): void
    {
        $this->newLine();
        $this->info('=== TABLE COMPARISON SUMMARY ===');
        $this->newLine();

        $matched = $new = $removed = 0;

        foreach ($comparison as $table => $data) {
            match ($data['status']) {
                'matched' => $matched++,
                'new_in_publishing' => $new++,
                'removed_from_publishing' => $removed++,
            };
        }

        $this->table(
            ['Category', 'Count'],
            [
                ['Matched tables', (string) $matched],
                ['New in Publishing', (string) $new],
                ['Only in Climactic', (string) $removed],
                ['Total Publishing tables', (string) count($pubSchema)],
                ['Total Climactic tables', (string) count($climSchema)],
            ]
        );

        $this->newLine();
        $this->info('=== COLUMN ANALYSIS (Matched Tables) ===');
        $this->newLine();

        $actionCounts = [
            'direct_match' => 0,
            'type_widened' => 0,
            'new_nullable' => 0,
            'new_required' => 0,
            'removed' => 0,
            'renamed' => 0,
            'type_changed' => 0,
        ];

        foreach ($comparison as $data) {
            if ($data['status'] !== 'matched') {
                continue;
            }

            foreach ($data['columns'] as $colData) {
                $action = $colData['action'];
                if (isset($actionCounts[$action])) {
                    $actionCounts[$action]++;
                }
            }
        }

        $this->table(
            ['Column Action', 'Count', 'Description'],
            [
                ['direct_match', (string) $actionCounts['direct_match'], 'Same column, compatible type'],
                ['type_widened', (string) $actionCounts['type_widened'], 'Publishing has broader type'],
                ['new_nullable', (string) $actionCounts['new_nullable'], 'New column, nullable - set NULL'],
                ['new_required', (string) $actionCounts['new_required'], 'New column, NOT NULL - needs default'],
                ['removed', (string) $actionCounts['removed'], 'Only in Climactic - archive or skip'],
                ['renamed', (string) $actionCounts['renamed'], 'Possible rename - manual review'],
                ['type_changed', (string) $actionCounts['type_changed'], 'Incompatible type - needs transform'],
            ]
        );

        $attentionTables = [];

        foreach ($comparison as $table => $data) {
            if ($data['status'] !== 'matched') {
                continue;
            }

            $issues = 0;
            foreach ($data['columns'] as $colData) {
                if (in_array($colData['action'], ['new_required', 'renamed', 'type_changed'], true)) {
                    $issues++;
                }
            }

            if ($issues > 0) {
                $attentionTables[] = [$table, (string) $issues];
            }
        }

        if (count($attentionTables) > 0) {
            $this->newLine();
            $this->warn('Tables requiring attention:');
            $this->table(['Table', 'Issues'], $attentionTables);
        }
    }

    /**
     * Build the final JSON mapping structure.
     *
     * @param  array<string, array{status: string, columns: array}>  $comparison
     * @param  array<string, array<string, array>>  $pubSchema
     * @param  array<string, array<string, array>>  $climSchema
     * @param  array<string, list<array{constraint_name: string, column_name: string, foreign_table: string, foreign_column: string}>>  $foreignKeys
     * @return array{generated_at: string, publishing_table_count: int, climactic_table_count: int, tables: array, import_order: list<string>}
     */
    private function buildMappingJson(array $comparison, array $pubSchema, array $climSchema, array $foreignKeys): array
    {
        $tables = [];

        foreach ($comparison as $table => $data) {
            $tables[$table] = [
                'status' => $data['status'],
                'source_count' => null,
                'columns' => $data['columns'],
                'foreign_keys' => $foreignKeys[$table] ?? [],
                'import_tier' => $this->resolveImportTier($table, $foreignKeys),
            ];
        }

        $importOrder = $this->computeImportOrder($comparison, $foreignKeys);

        return [
            'generated_at' => Carbon::now()->toIso8601String(),
            'publishing_table_count' => count($pubSchema),
            'climactic_table_count' => count($climSchema),
            'tables' => $tables,
            'import_order' => $importOrder,
        ];
    }

    /**
     * Write the mapping JSON file to disk.
     *
     * @param  array{generated_at: string, publishing_table_count: int, climactic_table_count: int, tables: array, import_order: list<string>}  $mapping
     */
    private function writeMapping(array $mapping): void
    {
        $outputPath = $this->option('output');

        if (! str_starts_with($outputPath, '/')) {
            $outputPath = base_path($outputPath);
        }

        $directory = dirname($outputPath);

        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        File::put($outputPath, json_encode($mapping, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        $this->newLine();
        $this->info("Mapping file written to: {$outputPath}");
        $this->line('  Tables mapped: '.count($mapping['tables']));
        $this->line('  Import order entries: '.count($mapping['import_order']));
    }
}

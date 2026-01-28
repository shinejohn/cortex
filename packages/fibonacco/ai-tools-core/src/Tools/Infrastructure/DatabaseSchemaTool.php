<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Tools\Infrastructure;

use Fibonacco\AiToolsCore\Tools\BaseTool;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSchemaTool extends BaseTool
{
    protected string $toolCategory = 'infrastructure';

    public function name(): string
    {
        return 'database_schema';
    }

    public function description(): string
    {
        return 'Get database schema information. ALWAYS use this FIRST before querying to understand table structure. Returns columns, types, and sample data.';
    }

    public function parameters(): array
    {
        return [
            'table' => [
                'type' => 'string',
                'description' => 'Table name to inspect (omit to list all available tables)',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        $table = $params['table'] ?? null;
        $allowedTables = config('ai-tools-core.tables.allowed', []);

        // List all tables
        if (!$table) {
            return [
                'available_tables' => $allowedTables,
                'hint' => 'Call with a specific table name to see its columns and sample data',
            ];
        }

        // Check table is allowed
        if (!in_array($table, $allowedTables, true)) {
            return [
                'error' => true,
                'message' => "Table '{$table}' not available. Use: " . implode(', ', $allowedTables),
            ];
        }

        // Get columns
        $columns = Schema::getColumnListing($table);
        $excludedColumns = config('ai-tools-core.tables.excluded_columns', []);
        $columns = array_diff($columns, $excludedColumns);

        // Get column types
        $columnDetails = [];
        foreach ($columns as $col) {
            try {
                $columnDetails[$col] = Schema::getColumnType($table, $col);
            } catch (\Exception $e) {
                $columnDetails[$col] = 'unknown';
            }
        }

        // Get sample data
        $sample = DB::table($table)
            ->select($columns)
            ->limit(3)
            ->get();

        // Get row count
        $rowCount = DB::table($table)->count();

        return [
            'table' => $table,
            'columns' => $columnDetails,
            'row_count' => $rowCount,
            'sample_data' => $sample->toArray(),
        ];
    }
}

<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Tools\Infrastructure;

use Fibonacco\AiToolsCore\Tools\BaseTool;
use Illuminate\Support\Facades\DB;

class DatabaseQueryTool extends BaseTool
{
    protected string $toolCategory = 'infrastructure';

    public function name(): string
    {
        return 'database_query';
    }

    public function description(): string
    {
        $tables = implode(', ', $this->getAllowedTables());
        return "Query database tables. Allowed: {$tables}. Use database_schema FIRST to understand structure.";
    }

    public function parameters(): array
    {
        return [
            'table' => [
                'type' => 'string',
                'description' => 'Table name to query',
                'required' => true,
            ],
            'select' => [
                'type' => 'array',
                'description' => 'Columns to select (omit for all)',
                'required' => false,
            ],
            'where' => [
                'type' => 'array',
                'description' => 'WHERE conditions as [[column, operator, value], ...]',
                'required' => false,
            ],
            'search' => [
                'type' => 'string',
                'description' => 'Full-text search term',
                'required' => false,
            ],
            'order_by' => [
                'type' => 'string',
                'description' => 'Column to sort by',
                'required' => false,
            ],
            'order_direction' => [
                'type' => 'enum',
                'enum' => ['asc', 'desc'],
                'description' => 'Sort direction',
                'required' => false,
            ],
            'limit' => [
                'type' => 'integer',
                'description' => 'Max rows to return (default 20, max 100)',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        $table = $params['table'] ?? '';
        $allowedTables = $this->getAllowedTables();
        $excludedColumns = $this->getExcludedColumns();

        // Security: Check table whitelist
        if (!in_array($table, $allowedTables, true)) {
            return [
                'error' => true,
                'message' => "Table '{$table}' not allowed. Available tables: " . implode(', ', $allowedTables),
            ];
        }

        $query = DB::table($table);

        // Select columns (excluding sensitive)
        if (!empty($params['select'])) {
            $safeColumns = array_diff($params['select'], $excludedColumns);
            $query->select($safeColumns);
        }

        // WHERE conditions
        if (!empty($params['where'])) {
            foreach ($params['where'] as $condition) {
                if (count($condition) === 3) {
                    $query->where($condition[0], $condition[1], $condition[2]);
                } elseif (count($condition) === 2) {
                    $query->where($condition[0], '=', $condition[1]);
                }
            }
        }

        // Full-text search
        if (!empty($params['search'])) {
            $searchColumns = $this->getSearchableColumns($table);
            $term = '%' . $params['search'] . '%';

            $query->where(function ($q) use ($searchColumns, $term) {
                foreach ($searchColumns as $col) {
                    $q->orWhere($col, 'ILIKE', $term);
                }
            });
        }

        // Order by
        if (!empty($params['order_by'])) {
            $direction = ($params['order_direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
            $query->orderBy($params['order_by'], $direction);
        }

        // Limit
        $limit = min((int) ($params['limit'] ?? 20), 100);
        $query->limit($limit);

        // Execute
        $results = $query->get();

        // Remove excluded columns from results
        $results = $results->map(function ($row) use ($excludedColumns) {
            return array_diff_key((array) $row, array_flip($excludedColumns));
        });

        return [
            'success' => true,
            'table' => $table,
            'count' => $results->count(),
            'data' => $results->toArray(),
        ];
    }

    protected function getAllowedTables(): array
    {
        return config('ai-tools-core.tables.allowed', []);
    }

    protected function getExcludedColumns(): array
    {
        return config('ai-tools-core.tables.excluded_columns', [
            'password',
            'remember_token',
            'api_token',
            'stripe_id',
        ]);
    }

    protected function getSearchableColumns(string $table): array
    {
        $config = config("ai-tools-core.tables.searchable.{$table}");

        if ($config) {
            return $config;
        }

        // Default searchable columns
        return ['name', 'title', 'description'];
    }
}

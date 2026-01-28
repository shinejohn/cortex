# Fibonacco AI Tools
## Shared Packages Specification

**Document:** 2 of 6  
**For:** Lead Developer / First implementer  
**Time:** 1-2 days

---

# What You're Building

Two Composer packages that will be installed in ALL Fibonacco platforms:

1. **fibonacco/ai-tools-core** - Base classes, infrastructure tools, agent runner
2. **fibonacco/ai-gateway-client** - HTTP client for calling the AI Gateway

---

# Package 1: ai-tools-core

## Step 1: Create GitHub Repository

```bash
# Create private repo: github.com/fibonacco/ai-tools-core
git clone git@github.com:fibonacco/ai-tools-core.git
cd ai-tools-core
mkdir -p src/{Contracts,Tools/Infrastructure,Agent}
mkdir -p config tests
```

## Step 2: Create composer.json

```json
{
    "name": "fibonacco/ai-tools-core",
    "description": "Core AI tools infrastructure for Fibonacco platforms",
    "type": "library",
    "license": "proprietary",
    "require": {
        "php": "^8.2",
        "illuminate/support": "^11.0",
        "illuminate/database": "^11.0",
        "illuminate/validation": "^11.0",
        "illuminate/cache": "^11.0",
        "illuminate/filesystem": "^11.0",
        "illuminate/http": "^11.0"
    },
    "require-dev": {
        "orchestra/testbench": "^9.0",
        "phpunit/phpunit": "^10.0"
    },
    "autoload": {
        "psr-4": {
            "Fibonacco\\AiToolsCore\\": "src/"
        }
    },
    "extra": {
        "laravel": {
            "providers": [
                "Fibonacco\\AiToolsCore\\AiToolsCoreServiceProvider"
            ]
        }
    },
    "minimum-stability": "stable"
}
```

## Step 3: Create Core Files

### src/Contracts/AiTool.php

```php
<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Contracts;

interface AiTool
{
    /**
     * Unique tool identifier (e.g., 'database_query')
     */
    public function name(): string;

    /**
     * Human-readable description for AI
     */
    public function description(): string;

    /**
     * Parameter definitions
     * 
     * Format: [
     *   'param_name' => [
     *     'type' => 'string|integer|boolean|array|enum',
     *     'description' => 'What this param does',
     *     'required' => true|false,
     *     'enum' => ['option1', 'option2'], // for enum type only
     *   ]
     * ]
     */
    public function parameters(): array;

    /**
     * Execute the tool
     */
    public function execute(array $parameters): mixed;

    /**
     * Convert to Prism Tool for LLM
     */
    public function toPrismTool(): \Prism\Prism\Tool;

    /**
     * Tool category for organization
     */
    public function category(): string;

    /**
     * Whether tool requires authenticated user
     */
    public function requiresAuth(): bool;

    /**
     * Required permission (null = no permission needed)
     */
    public function permission(): ?string;
}
```

### src/Tools/BaseTool.php

```php
<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Tools;

use Fibonacco\AiToolsCore\Contracts\AiTool;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Prism\Prism\Tool;
use Throwable;

abstract class BaseTool implements AiTool
{
    protected string $toolCategory = 'general';
    protected bool $authRequired = false;
    protected ?string $requiredPermission = null;
    protected bool $logExecutions = true;

    /**
     * Convert to Prism Tool definition
     */
    public function toPrismTool(): Tool
    {
        $tool = Tool::as($this->name())->for($this->description());

        foreach ($this->parameters() as $name => $config) {
            $desc = $config['description'] ?? '';
            $req = $config['required'] ?? false;

            $tool = match ($config['type']) {
                'string' => $tool->withStringParameter($name, $desc, $req),
                'integer', 'number' => $tool->withNumberParameter($name, $desc, $req),
                'boolean' => $tool->withBooleanParameter($name, $desc, $req),
                'array' => $tool->withArrayParameter($name, $desc, $req),
                'enum' => $tool->withEnumParameter($name, $config['enum'] ?? [], $desc, $req),
                default => $tool->withStringParameter($name, $desc, $req),
            };
        }

        return $tool->using(fn (...$args) => $this->safeExecute($this->mapArgs($args)));
    }

    /**
     * Map positional arguments to named parameters
     */
    protected function mapArgs(array $args): array
    {
        $keys = array_keys($this->parameters());
        $mapped = [];
        foreach ($args as $i => $v) {
            if (isset($keys[$i])) {
                $mapped[$keys[$i]] = $v;
            }
        }
        return $mapped;
    }

    /**
     * Safe execution with logging, validation, error handling
     */
    protected function safeExecute(array $params): string
    {
        $start = microtime(true);
        $toolName = $this->name();

        try {
            // Validate parameters
            $this->validateParameters($params);

            // Check authentication
            if ($this->authRequired && !auth()->check()) {
                throw new \RuntimeException("Tool '{$toolName}' requires authentication");
            }

            // Check permission
            if ($this->requiredPermission && !auth()->user()?->can($this->requiredPermission)) {
                throw new \RuntimeException("Permission denied for tool '{$toolName}'");
            }

            // Execute
            $result = $this->execute($params);

            // Log success
            if ($this->logExecutions) {
                Log::info("AI Tool: {$toolName}", [
                    'tool' => $toolName,
                    'category' => $this->category(),
                    'duration_ms' => round((microtime(true) - $start) * 1000, 2),
                    'platform' => config('ai-tools-core.platform', 'unknown'),
                    'user_id' => auth()->id(),
                ]);
            }

            return $this->formatResult($result);

        } catch (ValidationException $e) {
            Log::warning("AI Tool validation failed: {$toolName}", [
                'errors' => $e->errors(),
            ]);
            return json_encode([
                'error' => true,
                'type' => 'validation',
                'message' => implode(', ', array_map(fn($errs) => implode(', ', $errs), $e->errors())),
            ]);

        } catch (Throwable $e) {
            Log::error("AI Tool error: {$toolName}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return json_encode([
                'error' => true,
                'type' => 'execution',
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Validate parameters against schema
     */
    protected function validateParameters(array $params): void
    {
        $rules = [];

        foreach ($this->parameters() as $name => $config) {
            $ruleSet = [];

            if ($config['required'] ?? false) {
                $ruleSet[] = 'required';
            } else {
                $ruleSet[] = 'nullable';
            }

            $ruleSet[] = match ($config['type']) {
                'string' => 'string',
                'integer' => 'integer',
                'number' => 'numeric',
                'boolean' => 'boolean',
                'array' => 'array',
                'enum' => 'in:' . implode(',', $config['enum'] ?? []),
                default => 'string',
            };

            $rules[$name] = implode('|', $ruleSet);
        }

        $validator = Validator::make($params, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Format result for LLM consumption
     */
    protected function formatResult(mixed $result): string
    {
        if (is_string($result)) {
            return $result;
        }
        return json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Sanitize parameters for logging (remove sensitive data)
     */
    protected function sanitizeForLog(array $params): array
    {
        $sensitive = ['password', 'token', 'secret', 'key', 'api_key'];
        
        return array_map(function ($value, $key) use ($sensitive) {
            foreach ($sensitive as $pattern) {
                if (stripos($key, $pattern) !== false) {
                    return '[REDACTED]';
                }
            }
            if (is_string($value) && strlen($value) > 200) {
                return substr($value, 0, 200) . '...';
            }
            return $value;
        }, $params, array_keys($params));
    }

    public function category(): string
    {
        return $this->toolCategory;
    }

    public function requiresAuth(): bool
    {
        return $this->authRequired;
    }

    public function permission(): ?string
    {
        return $this->requiredPermission;
    }
}
```

### src/Tools/ToolRegistry.php

```php
<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Tools;

use Fibonacco\AiToolsCore\Contracts\AiTool;

class ToolRegistry
{
    /** @var array<string, AiTool> */
    protected array $tools = [];

    /** @var array<string, array<string>> */
    protected array $categories = [];

    /**
     * Register a tool
     */
    public function register(AiTool $tool): self
    {
        $name = $tool->name();
        $category = $tool->category();

        $this->tools[$name] = $tool;

        if (!isset($this->categories[$category])) {
            $this->categories[$category] = [];
        }
        $this->categories[$category][] = $name;

        return $this;
    }

    /**
     * Register multiple tools
     */
    public function registerMany(array $tools): self
    {
        foreach ($tools as $tool) {
            $this->register($tool);
        }
        return $this;
    }

    /**
     * Get tool by name
     */
    public function get(string $name): ?AiTool
    {
        return $this->tools[$name] ?? null;
    }

    /**
     * Check if tool exists
     */
    public function has(string $name): bool
    {
        return isset($this->tools[$name]);
    }

    /**
     * Get all tools
     */
    public function all(): array
    {
        return $this->tools;
    }

    /**
     * Get tool names
     */
    public function names(): array
    {
        return array_keys($this->tools);
    }

    /**
     * Get tools by category
     */
    public function byCategory(string $category): array
    {
        $names = $this->categories[$category] ?? [];
        return array_intersect_key($this->tools, array_flip($names));
    }

    /**
     * Get categories
     */
    public function categories(): array
    {
        return array_keys($this->categories);
    }

    /**
     * Get Prism Tool definitions
     */
    public function getPrismTools(?array $names = null): array
    {
        $tools = $names === null
            ? $this->tools
            : array_intersect_key($this->tools, array_flip($names));

        return array_map(
            fn(AiTool $tool) => $tool->toPrismTool(),
            array_values($tools)
        );
    }

    /**
     * Get tool descriptions for system prompt
     */
    public function getDescriptions(?array $names = null): string
    {
        $tools = $names === null
            ? $this->tools
            : array_intersect_key($this->tools, array_flip($names));

        $lines = [];
        foreach ($tools as $tool) {
            $params = implode(', ', array_keys($tool->parameters()));
            $lines[] = "• {$tool->name()}({$params}): {$tool->description()}";
        }

        return implode("\n", $lines);
    }

    /**
     * Execute tool by name
     */
    public function execute(string $name, array $parameters): mixed
    {
        $tool = $this->get($name);
        
        if (!$tool) {
            throw new \InvalidArgumentException("Unknown tool: {$name}");
        }
        
        return $tool->execute($parameters);
    }

    /**
     * Get tool schemas for documentation
     */
    public function getSchemas(): array
    {
        $schemas = [];
        
        foreach ($this->tools as $name => $tool) {
            $schemas[$name] = [
                'name' => $tool->name(),
                'description' => $tool->description(),
                'category' => $tool->category(),
                'requiresAuth' => $tool->requiresAuth(),
                'permission' => $tool->permission(),
                'parameters' => $tool->parameters(),
            ];
        }
        
        return $schemas;
    }
}
```

### src/Tools/Infrastructure/DatabaseQueryTool.php

```php
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
            'password', 'remember_token', 'api_token', 'stripe_id',
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
```

### src/Tools/Infrastructure/DatabaseSchemaTool.php

```php
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
```

### src/Agent/AgentRunner.php

```php
<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Agent;

use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Support\Facades\Log;

class AgentRunner
{
    public function __construct(
        protected ToolRegistry $registry
    ) {}

    /**
     * Run agent with tools
     */
    public function run(
        string $prompt,
        array $tools = [],
        ?array $model = null,
        ?string $systemPrompt = null
    ): AgentResult {
        $model = $model ?? config('ai-tools-core.default_model', ['openrouter', 'anthropic/claude-3-sonnet']);
        $tools = empty($tools) ? $this->registry->names() : $tools;
        $prismTools = $this->registry->getPrismTools($tools);
        $systemPrompt = $systemPrompt ?? $this->buildSystemPrompt($tools);

        try {
            $response = prism()
                ->text()
                ->using(...$model)
                ->withClientOptions(['timeout' => config('ai-tools-core.timeout', 120)])
                ->withSystemPrompt($systemPrompt)
                ->withPrompt($prompt)
                ->withTools($prismTools)
                ->generate();

            Log::info('Agent completed', [
                'platform' => config('ai-tools-core.platform'),
                'tools_available' => count($tools),
                'tools_used' => count($response->toolCalls ?? []),
            ]);

            return new AgentResult(
                success: true,
                response: $response->text,
                toolCalls: $response->toolCalls ?? []
            );

        } catch (\Exception $e) {
            Log::error('Agent failed', [
                'error' => $e->getMessage(),
                'platform' => config('ai-tools-core.platform'),
            ]);

            return new AgentResult(
                success: false,
                response: "Agent error: {$e->getMessage()}",
                error: $e->getMessage()
            );
        }
    }

    /**
     * Quick query with database tools
     */
    public function query(string $question, array $tools = ['database_schema', 'database_query']): string
    {
        return $this->run($question, $tools)->response;
    }

    /**
     * Build system prompt
     */
    protected function buildSystemPrompt(array $tools): string
    {
        $platform = config('ai-tools-core.platform', 'Fibonacco');
        $descriptions = $this->registry->getDescriptions($tools);

        return <<<PROMPT
You are an AI assistant for {$platform} with access to the following tools:

{$descriptions}

Guidelines:
1. Use database_schema FIRST before querying any table
2. Be precise - don't fetch more data than needed
3. Explain your reasoning before making tool calls
4. Return concise, actionable results
PROMPT;
    }
}
```

### src/Agent/AgentResult.php

```php
<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Agent;

class AgentResult
{
    public function __construct(
        public readonly bool $success,
        public readonly string $response,
        public readonly array $toolCalls = [],
        public readonly ?string $error = null
    ) {}

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'response' => $this->response,
            'tool_calls' => $this->toolCalls,
            'error' => $this->error,
        ];
    }

    public function failed(): bool
    {
        return !$this->success;
    }
}
```

### src/AiToolsCoreServiceProvider.php

```php
<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore;

use Fibonacco\AiToolsCore\Agent\AgentRunner;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Fibonacco\AiToolsCore\Tools\Infrastructure\DatabaseQueryTool;
use Fibonacco\AiToolsCore\Tools\Infrastructure\DatabaseSchemaTool;
use Illuminate\Support\ServiceProvider;

class AiToolsCoreServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/ai-tools-core.php', 'ai-tools-core');

        // Tool Registry as singleton
        $this->app->singleton(ToolRegistry::class, function ($app) {
            $registry = new ToolRegistry();

            // Register infrastructure tools
            $registry->registerMany([
                new DatabaseQueryTool(),
                new DatabaseSchemaTool(),
            ]);

            return $registry;
        });

        // Agent Runner as singleton
        $this->app->singleton(AgentRunner::class, function ($app) {
            return new AgentRunner($app->make(ToolRegistry::class));
        });
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__ . '/../config/ai-tools-core.php' => config_path('ai-tools-core.php'),
        ], 'ai-tools-core-config');
    }
}
```

### config/ai-tools-core.php

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Platform Identifier
    |--------------------------------------------------------------------------
    | Used for logging and identification
    */
    'platform' => env('AI_TOOLS_PLATFORM', 'fibonacco'),

    /*
    |--------------------------------------------------------------------------
    | Default AI Model
    |--------------------------------------------------------------------------
    | Model to use for agent execution
    */
    'default_model' => [
        env('AI_TOOLS_PROVIDER', 'openrouter'),
        env('AI_TOOLS_MODEL', 'anthropic/claude-3-sonnet'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Request Timeout
    |--------------------------------------------------------------------------
    */
    'timeout' => env('AI_TOOLS_TIMEOUT', 120),

    /*
    |--------------------------------------------------------------------------
    | Database Tables Configuration
    |--------------------------------------------------------------------------
    | Override these in your platform's config
    */
    'tables' => [
        // Tables AI can read from
        'allowed' => [
            // Add your tables here
        ],

        // Tables AI can write to
        'writable' => [
            // Add writable tables here
        ],

        // Columns to NEVER expose
        'excluded_columns' => [
            'password',
            'remember_token',
            'api_token',
            'stripe_id',
            'two_factor_secret',
        ],

        // Searchable columns per table
        'searchable' => [
            // 'users' => ['name', 'email'],
            // 'posts' => ['title', 'content'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging
    |--------------------------------------------------------------------------
    */
    'logging' => [
        'enabled' => env('AI_TOOLS_LOGGING', true),
        'channel' => env('AI_TOOLS_LOG_CHANNEL', 'stack'),
    ],
];
```

## Step 4: Push to GitHub

```bash
git add .
git commit -m "Initial ai-tools-core package"
git push origin main
git tag v1.0.0
git push --tags
```

---

# Package 2: ai-gateway-client

## Step 1: Create GitHub Repository

```bash
git clone git@github.com:fibonacco/ai-gateway-client.git
cd ai-gateway-client
mkdir -p src config
```

## Step 2: Create composer.json

```json
{
    "name": "fibonacco/ai-gateway-client",
    "description": "Client for Fibonacco AI Gateway",
    "type": "library",
    "license": "proprietary",
    "require": {
        "php": "^8.2",
        "illuminate/support": "^11.0",
        "illuminate/http": "^11.0"
    },
    "autoload": {
        "psr-4": {
            "Fibonacco\\AiGatewayClient\\": "src/"
        }
    },
    "extra": {
        "laravel": {
            "providers": [
                "Fibonacco\\AiGatewayClient\\AiGatewayClientServiceProvider"
            ]
        }
    }
}
```

## Step 3: Create Files

### src/AiGatewayClient.php

```php
<?php

declare(strict_types=1);

namespace Fibonacco\AiGatewayClient;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\RequestException;

class AiGatewayClient
{
    protected string $baseUrl;
    protected string $token;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('ai-gateway-client.url'), '/');
        $this->token = config('ai-gateway-client.token');
        $this->timeout = config('ai-gateway-client.timeout', 120);
    }

    /**
     * Simple query across all platforms
     */
    public function query(string $question): array
    {
        return $this->post('/api/ai/query', [
            'question' => $question,
        ]);
    }

    /**
     * Run agent with specific tools
     */
    public function agent(string $prompt, array $tools = [], array $context = []): array
    {
        return $this->post('/api/ai/agent', [
            'prompt' => $prompt,
            'tools' => $tools,
            'context' => $context,
        ]);
    }

    /**
     * Execute a workflow
     */
    public function workflow(array $workflow): array
    {
        return $this->post('/api/ai/workflow', $workflow);
    }

    /**
     * Search knowledge base
     */
    public function knowledge(string $query, ?string $platform = null): array
    {
        return $this->post('/api/ai/knowledge', [
            'query' => $query,
            'platform' => $platform,
        ]);
    }

    /**
     * Get available tools
     */
    public function tools(): array
    {
        return $this->get('/api/ai/tools');
    }

    /**
     * Get platform schemas
     */
    public function schemas(?string $platform = null): array
    {
        $endpoint = $platform 
            ? "/api/ai/schemas/{$platform}"
            : '/api/ai/schemas';
            
        return $this->get($endpoint);
    }

    /**
     * Make POST request
     */
    protected function post(string $endpoint, array $data): array
    {
        $response = Http::withToken($this->token)
            ->timeout($this->timeout)
            ->post($this->baseUrl . $endpoint, $data);

        if (!$response->successful()) {
            throw new \RuntimeException(
                "AI Gateway error [{$response->status()}]: " . $response->body()
            );
        }

        return $response->json();
    }

    /**
     * Make GET request
     */
    protected function get(string $endpoint): array
    {
        $response = Http::withToken($this->token)
            ->timeout($this->timeout)
            ->get($this->baseUrl . $endpoint);

        if (!$response->successful()) {
            throw new \RuntimeException(
                "AI Gateway error [{$response->status()}]: " . $response->body()
            );
        }

        return $response->json();
    }
}
```

### src/AiGatewayClientServiceProvider.php

```php
<?php

declare(strict_types=1);

namespace Fibonacco\AiGatewayClient;

use Illuminate\Support\ServiceProvider;

class AiGatewayClientServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/ai-gateway-client.php', 'ai-gateway-client');

        $this->app->singleton(AiGatewayClient::class, function () {
            return new AiGatewayClient();
        });
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__ . '/../config/ai-gateway-client.php' => config_path('ai-gateway-client.php'),
        ], 'ai-gateway-client-config');
    }
}
```

### config/ai-gateway-client.php

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Gateway URL
    |--------------------------------------------------------------------------
    */
    'url' => env('AI_GATEWAY_URL', 'https://ai-gateway.fibonacco.com'),

    /*
    |--------------------------------------------------------------------------
    | API Token
    |--------------------------------------------------------------------------
    */
    'token' => env('AI_GATEWAY_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | Request Timeout
    |--------------------------------------------------------------------------
    */
    'timeout' => env('AI_GATEWAY_TIMEOUT', 120),
];
```

## Step 4: Push to GitHub

```bash
git add .
git commit -m "Initial ai-gateway-client package"
git push origin main
git tag v1.0.0
git push --tags
```

---

# Testing the Packages

## Test in Day.News

```bash
cd /path/to/day-news

# Add repositories to composer.json
composer config repositories.ai-tools-core vcs git@github.com:fibonacco/ai-tools-core.git
composer config repositories.ai-gateway-client vcs git@github.com:fibonacco/ai-gateway-client.git

# Install packages
composer require fibonacco/ai-tools-core:^1.0
composer require fibonacco/ai-gateway-client:^1.0

# Publish config
php artisan vendor:publish --tag=ai-tools-core-config
```

## Create Test Command

```php
<?php
// app/Console/Commands/TestAiTools.php

namespace App\Console\Commands;

use Fibonacco\AiToolsCore\Agent\AgentRunner;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Console\Command;

class TestAiTools extends Command
{
    protected $signature = 'ai:test {question?}';
    protected $description = 'Test AI tools';

    public function handle(AgentRunner $agent, ToolRegistry $registry)
    {
        $this->info('Available tools: ' . implode(', ', $registry->names()));
        
        $question = $this->argument('question') ?? 'List all available tables';
        
        $this->info("Question: {$question}");
        $this->newLine();
        
        $result = $agent->query($question);
        
        $this->line($result);
    }
}
```

Run:

```bash
php artisan ai:test "How many users are in the system?"
```

---

# Checklist

- [ ] Created `fibonacco/ai-tools-core` repo
- [ ] Added all source files
- [ ] Tagged v1.0.0
- [ ] Created `fibonacco/ai-gateway-client` repo
- [ ] Added all source files
- [ ] Tagged v1.0.0
- [ ] Tested in Day.News
- [ ] Test command works

**Next:** Proceed to `3_AI_GATEWAY_SPEC.md` to build the Gateway service.

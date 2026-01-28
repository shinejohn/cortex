# AI Gateway Service
## Complete Specification

**Document:** 3 of 6  
**For:** Gateway developer / Infrastructure team  
**Time:** 2-3 days

---

# What You're Building

A standalone Laravel application that:
- Connects to ALL platform databases (read-only)
- Provides AI tools that query across platforms
- Calls platform APIs for write operations
- Exposes unified API for all platforms to use

---

# Prerequisites

Before starting:
- [ ] `fibonacco/ai-tools-core` package exists (Document 2)
- [ ] Read-only database users created on each platform
- [ ] Platform API tokens obtained

---

# Step 1: Create Laravel Application

```bash
composer create-project laravel/laravel ai-gateway
cd ai-gateway

# Install dependencies
composer require fibonacco/ai-tools-core:^1.0
composer require echolabs/prism
composer require laravel/sanctum

# Add repository to composer.json first:
# "repositories": [
#     {"type": "vcs", "url": "git@github.com:fibonacco/ai-tools-core.git"}
# ]
```

---

# Step 2: Database Configuration

## config/database.php

```php
<?php

return [
    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [
        // Gateway's own database
        'pgsql' => [
            'driver' => 'pgsql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'ai_gateway'),
            'username' => env('DB_USERNAME', 'ai_gateway'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'schema' => 'public',
        ],

        // Day.News Database (READ-ONLY)
        'daynews' => [
            'driver' => 'pgsql',
            'host' => env('DAYNEWS_DB_HOST'),
            'port' => env('DAYNEWS_DB_PORT', '5432'),
            'database' => env('DAYNEWS_DB_DATABASE'),
            'username' => env('DAYNEWS_DB_USERNAME'),
            'password' => env('DAYNEWS_DB_PASSWORD'),
            'charset' => 'utf8',
            'prefix' => '',
            'schema' => 'public',
        ],

        // TaskJuggler Database (READ-ONLY)
        'taskjuggler' => [
            'driver' => 'pgsql',
            'host' => env('TASKJUGGLER_DB_HOST'),
            'port' => env('TASKJUGGLER_DB_PORT', '5432'),
            'database' => env('TASKJUGGLER_DB_DATABASE'),
            'username' => env('TASKJUGGLER_DB_USERNAME'),
            'password' => env('TASKJUGGLER_DB_PASSWORD'),
            'charset' => 'utf8',
            'prefix' => '',
            'schema' => 'public',
        ],

        // Operations Center Database (READ-ONLY)
        'opscenter' => [
            'driver' => 'pgsql',
            'host' => env('OPSCENTER_DB_HOST'),
            'port' => env('OPSCENTER_DB_PORT', '5432'),
            'database' => env('OPSCENTER_DB_DATABASE'),
            'username' => env('OPSCENTER_DB_USERNAME'),
            'password' => env('OPSCENTER_DB_PASSWORD'),
            'charset' => 'utf8',
            'prefix' => '',
            'schema' => 'public',
        ],
    ],
];
```

## .env

```env
APP_NAME="Fibonacco AI Gateway"
APP_ENV=production
APP_DEBUG=false

# Gateway's own database
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=ai_gateway
DB_USERNAME=ai_gateway
DB_PASSWORD=your-secure-password

# Day.News Database (read-only user)
DAYNEWS_DB_HOST=daynews-db.internal.fibonacco.com
DAYNEWS_DB_PORT=5432
DAYNEWS_DB_DATABASE=daynews_production
DAYNEWS_DB_USERNAME=ai_gateway_ro
DAYNEWS_DB_PASSWORD=readonly-password

# TaskJuggler Database (read-only user)
TASKJUGGLER_DB_HOST=taskjuggler-db.internal.fibonacco.com
TASKJUGGLER_DB_PORT=5432
TASKJUGGLER_DB_DATABASE=taskjuggler_production
TASKJUGGLER_DB_USERNAME=ai_gateway_ro
TASKJUGGLER_DB_PASSWORD=readonly-password

# Operations Center Database (read-only user)
OPSCENTER_DB_HOST=opscenter-db.internal.fibonacco.com
OPSCENTER_DB_PORT=5432
OPSCENTER_DB_DATABASE=opscenter_production
OPSCENTER_DB_USERNAME=ai_gateway_ro
OPSCENTER_DB_PASSWORD=readonly-password

# Platform APIs (for write operations)
DAYNEWS_API_URL=https://api.day.news
DAYNEWS_API_TOKEN=daynews-api-token

TASKJUGGLER_API_URL=https://api.taskjuggler.fibonacco.com
TASKJUGGLER_API_TOKEN=taskjuggler-api-token

OPSCENTER_API_URL=https://api.opscenter.fibonacco.com
OPSCENTER_API_TOKEN=opscenter-api-token

# AI Configuration
OPENROUTER_API_KEY=your-openrouter-key
AI_TOOLS_PLATFORM=ai-gateway
AI_TOOLS_PROVIDER=openrouter
AI_TOOLS_MODEL=anthropic/claude-3-sonnet
```

---

# Step 3: Create Directory Structure

```bash
mkdir -p app/AiTools/{CrossPlatform,PlatformApi}
mkdir -p app/Services
mkdir -p app/Http/Controllers/Api
```

---

# Step 4: Cross-Platform Tools

## app/AiTools/CrossPlatform/MultiPlatformDatabaseTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\CrossPlatform;

use Fibonacco\AiToolsCore\Tools\BaseTool;
use Illuminate\Support\Facades\DB;

class MultiPlatformDatabaseTool extends BaseTool
{
    protected string $toolCategory = 'cross-platform';

    /**
     * Platform -> Tables whitelist
     */
    protected array $platformTables = [
        'daynews' => [
            'day_news_posts',
            'news_articles',
            'news_article_drafts',
            'businesses',
            'community_leaders',
            'polls',
            'poll_options',
            'poll_votes',
            'poll_calendars',
            'sales_opportunities',
            'events',
            'venues',
            'regions',
        ],
        'taskjuggler' => [
            'projects',
            'tasks',
            'subtasks',
            'teams',
            'team_members',
            'time_entries',
            'comments',
            'workflows',
            'workflow_steps',
            'resources',
            'allocations',
        ],
        'opscenter' => [
            'communities',
            'deployments',
            'deployment_logs',
            'ai_agents',
            'agent_metrics',
            'revenue_records',
            'subscriptions',
            'alerts',
            'partners',
            'stakeholders',
        ],
    ];

    public function name(): string
    {
        return 'platform_database';
    }

    public function description(): string
    {
        return 'Query any Fibonacco platform database. Platforms: daynews, taskjuggler, opscenter. Use platform_schema first to see available tables.';
    }

    public function parameters(): array
    {
        return [
            'platform' => [
                'type' => 'enum',
                'enum' => ['daynews', 'taskjuggler', 'opscenter'],
                'description' => 'Which platform database to query',
                'required' => true,
            ],
            'table' => [
                'type' => 'string',
                'description' => 'Table name',
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
                'description' => 'Max rows (default 20, max 100)',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        $platform = $params['platform'];
        $table = $params['table'];

        // Validate platform
        if (!isset($this->platformTables[$platform])) {
            return [
                'error' => true,
                'message' => "Unknown platform: {$platform}. Available: daynews, taskjuggler, opscenter",
            ];
        }

        // Validate table
        if (!in_array($table, $this->platformTables[$platform], true)) {
            return [
                'error' => true,
                'message' => "Table '{$table}' not available on {$platform}. Available: " . 
                    implode(', ', $this->platformTables[$platform]),
            ];
        }

        // Use platform's database connection
        $query = DB::connection($platform)->table($table);

        // Select
        if (!empty($params['select'])) {
            $query->select($params['select']);
        }

        // Where
        if (!empty($params['where'])) {
            foreach ($params['where'] as $condition) {
                if (count($condition) === 3) {
                    $query->where($condition[0], $condition[1], $condition[2]);
                } elseif (count($condition) === 2) {
                    $query->where($condition[0], '=', $condition[1]);
                }
            }
        }

        // Search
        if (!empty($params['search'])) {
            $searchColumns = $this->getSearchableColumns($platform, $table);
            $term = '%' . $params['search'] . '%';
            
            $query->where(function ($q) use ($searchColumns, $term) {
                foreach ($searchColumns as $col) {
                    $q->orWhere($col, 'ILIKE', $term);
                }
            });
        }

        // Order
        if (!empty($params['order_by'])) {
            $direction = ($params['order_direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
            $query->orderBy($params['order_by'], $direction);
        }

        // Limit
        $limit = min((int) ($params['limit'] ?? 20), 100);
        $results = $query->limit($limit)->get();

        return [
            'success' => true,
            'platform' => $platform,
            'table' => $table,
            'count' => $results->count(),
            'data' => $results->toArray(),
        ];
    }

    protected function getSearchableColumns(string $platform, string $table): array
    {
        $mapping = [
            'daynews' => [
                'businesses' => ['name', 'description', 'address'],
                'day_news_posts' => ['title', 'content', 'excerpt'],
                'news_articles' => ['title', 'content'],
                'polls' => ['title', 'description'],
                'events' => ['title', 'description'],
                'regions' => ['name', 'display_name'],
            ],
            'taskjuggler' => [
                'tasks' => ['title', 'description'],
                'projects' => ['name', 'description'],
                'teams' => ['name'],
                'comments' => ['content'],
            ],
            'opscenter' => [
                'communities' => ['name', 'display_name'],
                'alerts' => ['title', 'message'],
                'partners' => ['name', 'company'],
            ],
        ];

        return $mapping[$platform][$table] ?? ['name', 'title'];
    }
}
```

## app/AiTools/CrossPlatform/MultiPlatformSchemaTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\CrossPlatform;

use Fibonacco\AiToolsCore\Tools\BaseTool;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MultiPlatformSchemaTool extends BaseTool
{
    protected string $toolCategory = 'cross-platform';

    protected array $platformTables = [
        'daynews' => [
            'day_news_posts', 'news_articles', 'businesses', 'polls', 
            'poll_options', 'sales_opportunities', 'events', 'regions',
        ],
        'taskjuggler' => [
            'projects', 'tasks', 'subtasks', 'teams', 'time_entries', 'workflows',
        ],
        'opscenter' => [
            'communities', 'deployments', 'ai_agents', 'revenue_records', 'alerts',
        ],
    ];

    protected array $platformDescriptions = [
        'daynews' => 'Day.News - Hyperlocal news, businesses, polls, events',
        'taskjuggler' => 'TaskJuggler - Projects, tasks, time tracking, workflows',
        'opscenter' => 'Operations Center - Communities, deployments, AI agents, revenue',
    ];

    public function name(): string
    {
        return 'platform_schema';
    }

    public function description(): string
    {
        return 'Get database schema for any Fibonacco platform. ALWAYS use this FIRST before querying. Shows available platforms, tables, columns, and sample data.';
    }

    public function parameters(): array
    {
        return [
            'platform' => [
                'type' => 'enum',
                'enum' => ['daynews', 'taskjuggler', 'opscenter', 'all'],
                'description' => 'Platform to inspect. Use "all" to list all platforms.',
                'required' => false,
            ],
            'table' => [
                'type' => 'string',
                'description' => 'Specific table to get columns and sample data',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        $platform = $params['platform'] ?? 'all';
        $table = $params['table'] ?? null;

        // List all platforms
        if ($platform === 'all' || !$table) {
            return $this->listPlatforms($platform);
        }

        // Get specific table schema
        return $this->getTableSchema($platform, $table);
    }

    protected function listPlatforms(string $platformFilter): array
    {
        $platforms = $platformFilter === 'all' 
            ? array_keys($this->platformTables) 
            : [$platformFilter];

        $result = ['platforms' => []];

        foreach ($platforms as $p) {
            $result['platforms'][$p] = [
                'description' => $this->platformDescriptions[$p] ?? 'Unknown',
                'tables' => $this->platformTables[$p] ?? [],
            ];
        }

        $result['hint'] = 'Call with platform and table name to see columns and sample data';

        return $result;
    }

    protected function getTableSchema(string $platform, string $table): array
    {
        if (!isset($this->platformTables[$platform])) {
            return ['error' => true, 'message' => "Unknown platform: {$platform}"];
        }

        if (!in_array($table, $this->platformTables[$platform], true)) {
            return [
                'error' => true,
                'message' => "Table not available. Use: " . implode(', ', $this->platformTables[$platform]),
            ];
        }

        // Get columns from the platform's database
        $schemaBuilder = Schema::connection($platform);
        $columns = $schemaBuilder->getColumnListing($table);

        // Get column types
        $columnDetails = [];
        foreach ($columns as $col) {
            // Skip sensitive columns
            if (in_array($col, ['password', 'remember_token', 'api_token'], true)) {
                continue;
            }
            
            try {
                $columnDetails[$col] = $schemaBuilder->getColumnType($table, $col);
            } catch (\Exception $e) {
                $columnDetails[$col] = 'unknown';
            }
        }

        // Sample data
        $sample = DB::connection($platform)
            ->table($table)
            ->select(array_keys($columnDetails))
            ->limit(3)
            ->get();

        // Row count
        $rowCount = DB::connection($platform)->table($table)->count();

        return [
            'platform' => $platform,
            'table' => $table,
            'columns' => $columnDetails,
            'row_count' => $rowCount,
            'sample_data' => $sample->toArray(),
        ];
    }
}
```

---

# Step 5: Platform API Tools

## app/AiTools/PlatformApi/DayNewsApiTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\PlatformApi;

use Fibonacco\AiToolsCore\Tools\BaseTool;
use Illuminate\Support\Facades\Http;

class DayNewsApiTool extends BaseTool
{
    protected string $toolCategory = 'platform-api';
    protected bool $authRequired = true;

    public function name(): string
    {
        return 'daynews_api';
    }

    public function description(): string
    {
        return 'Perform write operations on Day.News. Actions: create_article, create_opportunity, create_poll, update_business.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['create_article', 'create_opportunity', 'create_poll', 'update_business', 'publish_article'],
                'description' => 'API action to perform',
                'required' => true,
            ],
            'data' => [
                'type' => 'array',
                'description' => 'Data for the action',
                'required' => true,
            ],
        ];
    }

    public function execute(array $params): array
    {
        $action = $params['action'];
        $data = $params['data'];

        $baseUrl = config('services.platforms.daynews.api_url');
        $token = config('services.platforms.daynews.api_token');

        $endpoint = match ($action) {
            'create_article' => '/api/v1/articles',
            'publish_article' => '/api/v1/articles/' . ($data['id'] ?? '') . '/publish',
            'create_opportunity' => '/api/v1/opportunities',
            'create_poll' => '/api/v1/polls',
            'update_business' => '/api/v1/businesses/' . ($data['id'] ?? ''),
            default => null,
        };

        if (!$endpoint) {
            return ['error' => true, 'message' => "Unknown action: {$action}"];
        }

        $method = str_starts_with($action, 'update') ? 'put' : 'post';

        try {
            $response = Http::withToken($token)
                ->timeout(30)
                ->$method($baseUrl . $endpoint, $data);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'action' => $action,
                    'platform' => 'daynews',
                    'response' => $response->json(),
                ];
            }

            return [
                'error' => true,
                'status' => $response->status(),
                'message' => $response->json()['message'] ?? $response->body(),
            ];
        } catch (\Exception $e) {
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
}
```

## app/AiTools/PlatformApi/TaskJugglerApiTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\PlatformApi;

use Fibonacco\AiToolsCore\Tools\BaseTool;
use Illuminate\Support\Facades\Http;

class TaskJugglerApiTool extends BaseTool
{
    protected string $toolCategory = 'platform-api';
    protected bool $authRequired = true;

    public function name(): string
    {
        return 'taskjuggler_api';
    }

    public function description(): string
    {
        return 'Perform write operations on TaskJuggler. Actions: create_task, update_task, complete_task, create_project, assign_task, log_time.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['create_task', 'update_task', 'complete_task', 'create_project', 'assign_task', 'log_time'],
                'description' => 'API action',
                'required' => true,
            ],
            'data' => [
                'type' => 'array',
                'description' => 'Action data',
                'required' => true,
            ],
        ];
    }

    public function execute(array $params): array
    {
        $action = $params['action'];
        $data = $params['data'];

        $baseUrl = config('services.platforms.taskjuggler.api_url');
        $token = config('services.platforms.taskjuggler.api_token');

        $method = 'post';
        $endpoint = match ($action) {
            'create_task' => '/api/v1/tasks',
            'update_task' => (function () use (&$method, $data) {
                $method = 'put';
                return '/api/v1/tasks/' . ($data['id'] ?? '');
            })(),
            'complete_task' => '/api/v1/tasks/' . ($data['id'] ?? '') . '/complete',
            'create_project' => '/api/v1/projects',
            'assign_task' => '/api/v1/tasks/' . ($data['id'] ?? '') . '/assign',
            'log_time' => '/api/v1/time-entries',
            default => null,
        };

        if (!$endpoint) {
            return ['error' => true, 'message' => "Unknown action: {$action}"];
        }

        try {
            $response = Http::withToken($token)
                ->timeout(30)
                ->$method($baseUrl . $endpoint, $data);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'action' => $action,
                    'platform' => 'taskjuggler',
                    'response' => $response->json(),
                ];
            }

            return [
                'error' => true,
                'status' => $response->status(),
                'message' => $response->json()['message'] ?? $response->body(),
            ];
        } catch (\Exception $e) {
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
}
```

---

# Step 6: Service Provider

## app/Providers/AiToolsServiceProvider.php

```php
<?php

namespace App\Providers;

use App\AiTools\CrossPlatform\MultiPlatformDatabaseTool;
use App\AiTools\CrossPlatform\MultiPlatformSchemaTool;
use App\AiTools\PlatformApi\DayNewsApiTool;
use App\AiTools\PlatformApi\TaskJugglerApiTool;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Support\ServiceProvider;

class AiToolsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Get the registry from the core package
        $registry = $this->app->make(ToolRegistry::class);

        // Add Gateway-specific cross-platform tools
        $registry->registerMany([
            new MultiPlatformDatabaseTool(),
            new MultiPlatformSchemaTool(),
            new DayNewsApiTool(),
            new TaskJugglerApiTool(),
        ]);
    }
}
```

Register in `config/app.php`:

```php
'providers' => [
    // ...
    App\Providers\AiToolsServiceProvider::class,
],
```

---

# Step 7: API Routes

## routes/api.php

```php
<?php

use App\Http\Controllers\Api\AiGatewayController;
use App\Http\Controllers\Api\WorkflowController;
use Illuminate\Support\Facades\Route;

Route::prefix('ai')->middleware(['auth:sanctum'])->group(function () {
    // Query endpoint
    Route::post('/query', [AiGatewayController::class, 'query']);
    
    // Agent endpoint
    Route::post('/agent', [AiGatewayController::class, 'agent']);
    
    // Workflow endpoint
    Route::post('/workflow', [WorkflowController::class, 'execute']);
    
    // Tools listing
    Route::get('/tools', [AiGatewayController::class, 'tools']);
    
    // Schema endpoint
    Route::get('/schemas/{platform?}', [AiGatewayController::class, 'schemas']);
});
```

---

# Step 8: Controllers

## app/Http/Controllers/Api/AiGatewayController.php

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Fibonacco\AiToolsCore\Agent\AgentRunner;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiGatewayController extends Controller
{
    public function __construct(
        protected ToolRegistry $registry,
        protected AgentRunner $agent
    ) {}

    /**
     * POST /api/ai/query
     * Simple question answering
     */
    public function query(Request $request): JsonResponse
    {
        $request->validate([
            'question' => 'required|string|max:2000',
        ]);

        $result = $this->agent->run(
            prompt: $request->question,
            tools: ['platform_schema', 'platform_database']
        );

        return response()->json([
            'success' => $result->success,
            'answer' => $result->response,
            'tools_used' => count($result->toolCalls),
        ]);
    }

    /**
     * POST /api/ai/agent
     * Run agent with specific tools
     */
    public function agent(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => 'required|string|max:5000',
            'tools' => 'array',
            'context' => 'array',
        ]);

        $result = $this->agent->run(
            prompt: $request->prompt,
            tools: $request->tools ?? []
        );

        return response()->json($result->toArray());
    }

    /**
     * GET /api/ai/tools
     * List available tools
     */
    public function tools(): JsonResponse
    {
        return response()->json([
            'tools' => $this->registry->getSchemas(),
            'categories' => $this->registry->categories(),
        ]);
    }

    /**
     * GET /api/ai/schemas/{platform?}
     * Get platform schemas
     */
    public function schemas(?string $platform = null): JsonResponse
    {
        $schemaTool = $this->registry->get('platform_schema');
        
        $result = $schemaTool->execute([
            'platform' => $platform ?? 'all',
        ]);

        return response()->json($result);
    }
}
```

---

# Step 9: Platform API Config

## config/services.php

Add:

```php
'platforms' => [
    'daynews' => [
        'api_url' => env('DAYNEWS_API_URL'),
        'api_token' => env('DAYNEWS_API_TOKEN'),
    ],
    'taskjuggler' => [
        'api_url' => env('TASKJUGGLER_API_URL'),
        'api_token' => env('TASKJUGGLER_API_TOKEN'),
    ],
    'opscenter' => [
        'api_url' => env('OPSCENTER_API_URL'),
        'api_token' => env('OPSCENTER_API_TOKEN'),
    ],
],
```

---

# Step 10: Create Read-Only Database Users

Run these on each platform's database:

## Day.News PostgreSQL

```sql
-- Create read-only user for AI Gateway
CREATE USER ai_gateway_ro WITH PASSWORD 'secure-readonly-password';

-- Grant connect
GRANT CONNECT ON DATABASE daynews_production TO ai_gateway_ro;

-- Grant schema access
GRANT USAGE ON SCHEMA public TO ai_gateway_ro;

-- Grant SELECT on all current tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_gateway_ro;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ai_gateway_ro;
```

## TaskJuggler PostgreSQL

```sql
CREATE USER ai_gateway_ro WITH PASSWORD 'secure-readonly-password';
GRANT CONNECT ON DATABASE taskjuggler_production TO ai_gateway_ro;
GRANT USAGE ON SCHEMA public TO ai_gateway_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_gateway_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ai_gateway_ro;
```

## Operations Center PostgreSQL

```sql
CREATE USER ai_gateway_ro WITH PASSWORD 'secure-readonly-password';
GRANT CONNECT ON DATABASE opscenter_production TO ai_gateway_ro;
GRANT USAGE ON SCHEMA public TO ai_gateway_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_gateway_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ai_gateway_ro;
```

---

# Step 11: Authentication Setup

## Create API Tokens

```bash
php artisan install:api

# Create tokens for each platform
php artisan tinker

> $user = User::create(['name' => 'Day.News', 'email' => 'daynews@fibonacco.com', 'password' => bcrypt('xxx')]);
> $user->createToken('daynews-gateway-access')->plainTextToken;
# Save this - give to Day.News team for AI_GATEWAY_TOKEN

> $user = User::create(['name' => 'TaskJuggler', 'email' => 'taskjuggler@fibonacco.com', 'password' => bcrypt('xxx')]);
> $user->createToken('taskjuggler-gateway-access')->plainTextToken;
# Save this - give to TaskJuggler team

> $user = User::create(['name' => 'OpsCenter', 'email' => 'opscenter@fibonacco.com', 'password' => bcrypt('xxx')]);
> $user->createToken('opscenter-gateway-access')->plainTextToken;
# Save this - give to Ops Center team
```

---

# Step 12: Deploy

## Docker Compose Example

```yaml
version: '3.8'

services:
  ai-gateway:
    build: .
    ports:
      - "8080:80"
    environment:
      - APP_ENV=production
      - DB_HOST=gateway-db
      - DAYNEWS_DB_HOST=daynews-db.internal
      - TASKJUGGLER_DB_HOST=taskjuggler-db.internal
      - OPSCENTER_DB_HOST=opscenter-db.internal
    networks:
      - fibonacco-internal

networks:
  fibonacco-internal:
    external: true
```

---

# Testing

```bash
# Test query endpoint
curl -X POST https://ai-gateway.fibonacco.com/api/ai/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "How many businesses are in the daynews database?"}'

# Test tools endpoint
curl https://ai-gateway.fibonacco.com/api/ai/tools \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

# Checklist

- [ ] Laravel app created
- [ ] Database connections configured
- [ ] Cross-platform tools created
- [ ] Platform API tools created
- [ ] Service provider registered
- [ ] API routes defined
- [ ] Read-only DB users created on all platforms
- [ ] API tokens generated for each platform
- [ ] Deployed and accessible

**Next:** Provide platform integration guides to each team.

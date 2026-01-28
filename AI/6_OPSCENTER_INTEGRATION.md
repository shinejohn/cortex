# Operations Center AI Integration Guide

**Document:** 6 of 6  
**For:** Operations Center development team  
**Time:** 1-2 days

---

# What You're Doing

Operations Center is the **master orchestrator**. You will:

1. Install shared packages
2. Configure for Ops Center database
3. Build Ops Center-specific domain tools
4. Build the **Workflow Orchestrator** for multi-platform campaigns
5. Create the campaign UI

---

# Step 1: Install Packages

```bash
composer require fibonacco/ai-tools-core:^1.0
composer require fibonacco/ai-gateway-client:^1.0

php artisan vendor:publish --tag=ai-tools-core-config
php artisan vendor:publish --tag=ai-gateway-client-config
```

---

# Step 2: Configure

## config/ai-tools-core.php

```php
<?php

return [
    'platform' => 'opscenter',

    'default_model' => [
        env('AI_TOOLS_PROVIDER', 'openrouter'),
        env('AI_TOOLS_MODEL', 'anthropic/claude-3-sonnet'),
    ],

    'tables' => [
        'allowed' => [
            // Communities
            'communities',
            'community_settings',
            
            // Deployments
            'deployments',
            'deployment_logs',
            
            // AI Agents
            'ai_agents',
            'agent_metrics',
            'agent_executions',
            
            // Revenue
            'revenue_records',
            'subscriptions',
            'invoices',
            
            // Alerts
            'alerts',
            'alert_rules',
            
            // Partners
            'partners',
            'stakeholders',
            
            // Workflows
            'workflow_executions',
            'workflow_steps',
        ],

        'writable' => [
            'alerts',
            'deployment_logs',
            'workflow_executions',
        ],

        'searchable' => [
            'communities' => ['name', 'display_name', 'state', 'city'],
            'alerts' => ['title', 'message'],
            'partners' => ['name', 'company'],
            'ai_agents' => ['name', 'type'],
        ],
    ],
];
```

## .env additions

```env
AI_TOOLS_PLATFORM=opscenter
AI_GATEWAY_URL=https://ai-gateway.fibonacco.com
AI_GATEWAY_TOKEN=your-opscenter-gateway-token
```

---

# Step 3: Create Domain Tools

## app/AiTools/Domain/CommunityTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Community;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class CommunityTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'community';
    }

    public function description(): string
    {
        return 'Manage communities. Actions: list, get, stats, by_state, healthy, at_risk.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['list', 'get', 'stats', 'by_state', 'healthy', 'at_risk'],
                'required' => true,
            ],
            'id' => ['type' => 'string', 'required' => false],
            'state' => ['type' => 'string', 'required' => false],
            'limit' => ['type' => 'integer', 'required' => false],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'list' => $this->listCommunities($params['limit'] ?? 20),
            'get' => $this->getCommunity($params['id'] ?? ''),
            'stats' => $this->getStats($params['id'] ?? ''),
            'by_state' => $this->byState($params['state'] ?? '', $params['limit'] ?? 20),
            'healthy' => $this->getHealthy($params['limit'] ?? 20),
            'at_risk' => $this->getAtRisk($params['limit'] ?? 20),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function listCommunities(int $limit): array
    {
        $communities = Community::with('latestMetrics')
            ->limit($limit)
            ->get(['id', 'name', 'display_name', 'state', 'status']);

        return ['count' => $communities->count(), 'communities' => $communities->toArray()];
    }

    protected function getCommunity(string $id): array
    {
        $community = Community::with(['settings', 'latestMetrics'])->find($id);
        
        if (!$community) {
            return ['error' => true, 'message' => 'Community not found'];
        }

        return ['community' => $community->toArray()];
    }

    protected function getStats(string $id): array
    {
        $community = Community::with('latestMetrics')->find($id);
        
        if (!$community) {
            return ['error' => true, 'message' => 'Community not found'];
        }

        $metrics = $community->latestMetrics;

        return [
            'community' => $community->name,
            'stats' => [
                'monthly_revenue' => $metrics?->monthly_revenue ?? 0,
                'active_businesses' => $metrics?->active_businesses ?? 0,
                'articles_this_month' => $metrics?->articles_count ?? 0,
                'engagement_rate' => $metrics?->engagement_rate ?? 0,
                'health_score' => $metrics?->health_score ?? 0,
            ],
        ];
    }

    protected function byState(string $state, int $limit): array
    {
        $communities = Community::where('state', $state)
            ->limit($limit)
            ->get(['id', 'name', 'city', 'status']);

        return ['state' => $state, 'count' => $communities->count(), 'communities' => $communities->toArray()];
    }

    protected function getHealthy(int $limit): array
    {
        $communities = Community::whereHas('latestMetrics', function ($q) {
            $q->where('health_score', '>=', 80);
        })->limit($limit)->get(['id', 'name', 'state']);

        return [
            'description' => 'Communities with health score >= 80',
            'count' => $communities->count(),
            'communities' => $communities->toArray(),
        ];
    }

    protected function getAtRisk(int $limit): array
    {
        $communities = Community::whereHas('latestMetrics', function ($q) {
            $q->where('health_score', '<', 50);
        })->limit($limit)->get(['id', 'name', 'state']);

        return [
            'description' => 'Communities with health score < 50',
            'count' => $communities->count(),
            'communities' => $communities->toArray(),
        ];
    }
}
```

## app/AiTools/Domain/MetricsTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\RevenueRecord;
use App\Models\Community;
use Fibonacco\AiToolsCore\Tools\BaseTool;
use Illuminate\Support\Facades\DB;

class MetricsTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'metrics';
    }

    public function description(): string
    {
        return 'Get business metrics. Actions: revenue_summary, revenue_by_community, growth_trends, top_performers.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['revenue_summary', 'revenue_by_community', 'growth_trends', 'top_performers'],
                'required' => true,
            ],
            'community_id' => ['type' => 'string', 'required' => false],
            'period' => [
                'type' => 'enum',
                'enum' => ['day', 'week', 'month', 'quarter', 'year'],
                'required' => false,
            ],
            'limit' => ['type' => 'integer', 'required' => false],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'revenue_summary' => $this->revenueSummary($params['period'] ?? 'month'),
            'revenue_by_community' => $this->revenueByCommunity($params['limit'] ?? 20),
            'growth_trends' => $this->growthTrends($params['community_id'] ?? null),
            'top_performers' => $this->topPerformers($params['limit'] ?? 10),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function revenueSummary(string $period): array
    {
        $startDate = match ($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $total = RevenueRecord::where('recorded_at', '>=', $startDate)->sum('amount');
        $count = RevenueRecord::where('recorded_at', '>=', $startDate)->count();

        $previousStart = match ($period) {
            'day' => now()->subDay()->startOfDay(),
            'week' => now()->subWeek()->startOfWeek(),
            'month' => now()->subMonth()->startOfMonth(),
            'quarter' => now()->subQuarter()->startOfQuarter(),
            'year' => now()->subYear()->startOfYear(),
            default => now()->subMonth()->startOfMonth(),
        };

        $previousTotal = RevenueRecord::whereBetween('recorded_at', [$previousStart, $startDate])->sum('amount');
        $growth = $previousTotal > 0 ? round((($total - $previousTotal) / $previousTotal) * 100, 1) : 0;

        return [
            'period' => $period,
            'total_revenue' => $total,
            'transaction_count' => $count,
            'previous_period_revenue' => $previousTotal,
            'growth_percentage' => $growth,
        ];
    }

    protected function revenueByCommunity(int $limit): array
    {
        $communities = Community::select('id', 'name')
            ->withSum(['revenueRecords as total_revenue' => function ($q) {
                $q->where('recorded_at', '>=', now()->startOfMonth());
            }], 'amount')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();

        return [
            'period' => 'This month',
            'communities' => $communities->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'revenue' => $c->total_revenue ?? 0,
            ])->toArray(),
        ];
    }

    protected function growthTrends(?string $communityId): array
    {
        $query = RevenueRecord::select(
            DB::raw("DATE_TRUNC('month', recorded_at) as month"),
            DB::raw('SUM(amount) as total')
        );

        if ($communityId) {
            $query->where('community_id', $communityId);
        }

        $trends = $query->where('recorded_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'period' => 'Last 6 months',
            'community_id' => $communityId,
            'trends' => $trends->map(fn($t) => [
                'month' => $t->month,
                'revenue' => $t->total,
            ])->toArray(),
        ];
    }

    protected function topPerformers(int $limit): array
    {
        $communities = Community::select('id', 'name', 'state')
            ->whereHas('latestMetrics', function ($q) {
                $q->where('health_score', '>=', 80);
            })
            ->with(['latestMetrics' => function ($q) {
                $q->select('community_id', 'health_score', 'monthly_revenue', 'engagement_rate');
            }])
            ->limit($limit)
            ->get();

        return [
            'description' => 'Top performing communities',
            'communities' => $communities->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'state' => $c->state,
                'health_score' => $c->latestMetrics?->health_score,
                'monthly_revenue' => $c->latestMetrics?->monthly_revenue,
            ])->toArray(),
        ];
    }
}
```

---

# Step 4: The Workflow Orchestrator

This is the key component for cross-platform campaigns.

## app/Services/WorkflowOrchestrator.php

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\WorkflowExecution;
use Fibonacco\AiGatewayClient\AiGatewayClient;
use Illuminate\Support\Facades\Log;

class WorkflowOrchestrator
{
    public function __construct(
        protected AiGatewayClient $gateway
    ) {}

    /**
     * Execute a business event campaign workflow
     */
    public function executeEventCampaign(array $params): WorkflowResult
    {
        $workflowId = uuid_create();

        // Create execution record
        $execution = WorkflowExecution::create([
            'id' => $workflowId,
            'type' => 'business_event_campaign',
            'status' => 'running',
            'params' => $params,
            'initiated_by' => auth()->id(),
        ]);

        $results = [];

        try {
            // Step 1: Create Day.News articles
            if (!empty($params['publish_dates'])) {
                $results['articles'] = $this->createArticles($params);
                $this->logStep($execution, 'articles', $results['articles']);
            }

            // Step 2: Schedule social posts
            if (!empty($params['social_platforms'])) {
                $results['social'] = $this->scheduleSocialPosts($params);
                $this->logStep($execution, 'social', $results['social']);
            }

            // Step 3: Create TaskJuggler tasks
            if (!empty($params['tasks'])) {
                $results['tasks'] = $this->createTasks($params);
                $this->logStep($execution, 'tasks', $results['tasks']);
            }

            // Step 4: Update 4Calls knowledge
            if (!empty($params['call_script'])) {
                $results['4calls'] = $this->updateCallScript($params);
                $this->logStep($execution, '4calls', $results['4calls']);
            }

            // Step 5: Create URPA appointments
            if (!empty($params['urpa_client_id'])) {
                $results['urpa'] = $this->createUrpaItems($params);
                $this->logStep($execution, 'urpa', $results['urpa']);
            }

            $execution->update([
                'status' => 'completed',
                'completed_at' => now(),
                'results' => $results,
            ]);

            return new WorkflowResult(
                success: true,
                workflowId: $workflowId,
                steps: $results
            );

        } catch (\Exception $e) {
            Log::error('Workflow failed', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
            ]);

            $execution->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            return new WorkflowResult(
                success: false,
                workflowId: $workflowId,
                error: $e->getMessage()
            );
        }
    }

    protected function createArticles(array $params): array
    {
        $result = $this->gateway->agent(
            prompt: $this->buildArticlePrompt($params),
            tools: ['platform_database', 'daynews_api']
        );

        return $result;
    }

    protected function scheduleSocialPosts(array $params): array
    {
        // If you have a social media service, call it here
        // For now, return a placeholder
        return ['scheduled' => count($params['social_platforms']) * count($params['publish_dates'] ?? [1])];
    }

    protected function createTasks(array $params): array
    {
        $results = [];

        foreach ($params['tasks'] as $task) {
            $result = $this->gateway->agent(
                prompt: "Create a task in TaskJuggler: {$task['title']} for project '{$params['project'] ?? 'Event Campaigns'}' due {$task['due']}",
                tools: ['taskjuggler_api']
            );
            $results[] = $result;
        }

        return ['tasks_created' => count($results), 'details' => $results];
    }

    protected function updateCallScript(array $params): array
    {
        // Integrate with 4Calls API
        return ['updated' => true, 'business_id' => $params['business_id']];
    }

    protected function createUrpaItems(array $params): array
    {
        // Integrate with URPA API
        return [
            'tasks_created' => count($params['urpa_tasks'] ?? []),
            'appointments_created' => count($params['urpa_appointments'] ?? []),
        ];
    }

    protected function buildArticlePrompt(array $params): string
    {
        return <<<PROMPT
Create a promotional article for Day.News about this business event:

Business: {$params['business_name']}
Event: {$params['event_name']}
Event Date: {$params['event_date']}
Description: {$params['event_description']}
Location: {$params['location']}

Create the article and schedule it for publication on {$params['publish_dates'][0]}.
Use the daynews_api tool to create the article.
PROMPT;
    }

    protected function logStep(WorkflowExecution $execution, string $step, array $result): void
    {
        $execution->steps()->create([
            'step_name' => $step,
            'status' => isset($result['error']) ? 'failed' : 'completed',
            'result' => $result,
            'completed_at' => now(),
        ]);
    }
}
```

## app/Services/WorkflowResult.php

```php
<?php

namespace App\Services;

class WorkflowResult
{
    public function __construct(
        public readonly bool $success,
        public readonly string $workflowId,
        public readonly array $steps = [],
        public readonly ?string $error = null
    ) {}

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'workflow_id' => $this->workflowId,
            'steps' => $this->steps,
            'error' => $this->error,
        ];
    }
}
```

---

# Step 5: Campaign Controller

## app/Http/Controllers/CampaignController.php

```php
<?php

namespace App\Http\Controllers;

use App\Services\WorkflowOrchestrator;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function __construct(
        protected WorkflowOrchestrator $orchestrator
    ) {}

    /**
     * Show campaign creation form
     */
    public function create()
    {
        return inertia('Campaigns/Create');
    }

    /**
     * Execute campaign workflow
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_id' => 'required|uuid',
            'business_name' => 'required|string',
            'event_name' => 'required|string',
            'event_date' => 'required|date',
            'event_description' => 'required|string',
            'location' => 'required|string',
            'publish_dates' => 'required|array|min:1',
            'publish_dates.*' => 'date',
            'social_platforms' => 'array',
            'tasks' => 'array',
            'tasks.*.title' => 'required|string',
            'tasks.*.due' => 'required|date',
            'call_script' => 'array',
            'urpa_client_id' => 'nullable|uuid',
            'urpa_tasks' => 'array',
            'urpa_appointments' => 'array',
        ]);

        $result = $this->orchestrator->executeEventCampaign($validated);

        if ($result->success) {
            return redirect()
                ->route('campaigns.show', $result->workflowId)
                ->with('success', 'Campaign created successfully!');
        }

        return back()
            ->withErrors(['workflow' => $result->error])
            ->withInput();
    }

    /**
     * Show campaign status
     */
    public function show(string $id)
    {
        $execution = WorkflowExecution::with('steps')->findOrFail($id);

        return inertia('Campaigns/Show', [
            'execution' => $execution,
        ]);
    }
}
```

---

# Step 6: Register Everything

## app/Providers/AiToolsServiceProvider.php

```php
<?php

namespace App\Providers;

use App\AiTools\Domain\CommunityTool;
use App\AiTools\Domain\MetricsTool;
use App\Services\WorkflowOrchestrator;
use Fibonacco\AiGatewayClient\AiGatewayClient;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Support\ServiceProvider;

class AiToolsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(WorkflowOrchestrator::class, function ($app) {
            return new WorkflowOrchestrator(
                $app->make(AiGatewayClient::class)
            );
        });
    }

    public function boot(): void
    {
        $registry = $this->app->make(ToolRegistry::class);

        $registry->registerMany([
            new CommunityTool(),
            new MetricsTool(),
        ]);
    }
}
```

---

# Checklist

- [ ] Installed packages
- [ ] Configured `config/ai-tools-core.php`
- [ ] Created domain tools (CommunityTool, MetricsTool)
- [ ] Created WorkflowOrchestrator
- [ ] Created CampaignController
- [ ] Registered ServiceProvider
- [ ] Created campaign UI (Inertia pages)
- [ ] Tested local queries
- [ ] Tested campaign workflow end-to-end

---

# What Operations Center Can Now Do

```php
// Local queries
$agent->query("Show me communities at risk");
$agent->query("What's our revenue this month?");
$agent->query("List top performing communities");

// Cross-platform queries via Gateway
$gateway->query("Find businesses in Day.News without TaskJuggler tasks");
$gateway->query("Show communities where article count is up but revenue is down");

// Full campaign workflow
$orchestrator->executeEventCampaign([
    'business_name' => 'Clearwater Brewing',
    'event_name' => 'Summer Beer Festival',
    'event_date' => '2026-07-15',
    'publish_dates' => ['2026-07-01', '2026-07-08', '2026-07-14'],
    'social_platforms' => ['facebook', 'instagram'],
    'tasks' => [
        ['title' => 'Create event banner', 'due' => '2026-06-28'],
        ['title' => 'Review articles', 'due' => '2026-06-30'],
    ],
    // ... creates articles, social posts, tasks, call scripts, appointments
]);
```

This is the **power center** of Fibonacco - one workflow touches every platform.

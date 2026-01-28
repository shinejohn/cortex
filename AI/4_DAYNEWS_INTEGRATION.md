# Day.News AI Integration Guide

**Document:** 4 of 6  
**For:** Day.News development team / Cursor  
**Time:** 1 day

---

# What You're Doing

1. Install shared packages
2. Configure for Day.News database
3. Build Day.News-specific domain tools
4. Connect to AI Gateway for cross-platform queries

---

# Step 1: Install Packages

Add to `composer.json`:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "git@github.com:fibonacco/ai-tools-core.git"
        },
        {
            "type": "vcs",
            "url": "git@github.com:fibonacco/ai-gateway-client.git"
        }
    ]
}
```

Then:

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
    'platform' => 'daynews',

    'default_model' => [
        env('AI_TOOLS_PROVIDER', 'openrouter'),
        env('AI_TOOLS_MODEL', 'anthropic/claude-3-sonnet'),
    ],

    'timeout' => 120,

    'tables' => [
        'allowed' => [
            // News content
            'day_news_posts',
            'news_articles',
            'news_article_drafts',
            'news_fact_checks',
            
            // Business data
            'businesses',
            'community_leaders',
            
            // Polls & engagement
            'polls',
            'poll_options',
            'poll_votes',
            'poll_calendars',
            
            // Sales
            'sales_opportunities',
            
            // Events
            'events',
            'venues',
            'performers',
            
            // Geographic
            'regions',
            'zip_codes',
        ],

        'writable' => [
            'sales_opportunities',
            'poll_votes',
        ],

        'excluded_columns' => [
            'password',
            'remember_token',
            'api_token',
            'stripe_id',
        ],

        'searchable' => [
            'businesses' => ['name', 'description', 'address', 'category'],
            'day_news_posts' => ['title', 'content', 'excerpt'],
            'news_articles' => ['title', 'content'],
            'polls' => ['title', 'description'],
            'events' => ['title', 'description', 'venue_name'],
            'regions' => ['name', 'display_name'],
        ],
    ],
];
```

## config/ai-gateway-client.php

```php
<?php

return [
    'url' => env('AI_GATEWAY_URL', 'https://ai-gateway.fibonacco.com'),
    'token' => env('AI_GATEWAY_TOKEN'),
    'timeout' => 120,
];
```

## .env additions

```env
# Local AI Tools
AI_TOOLS_PLATFORM=daynews
AI_TOOLS_PROVIDER=openrouter
AI_TOOLS_MODEL=anthropic/claude-3-sonnet

# AI Gateway (for cross-platform queries)
AI_GATEWAY_URL=https://ai-gateway.fibonacco.com
AI_GATEWAY_TOKEN=your-gateway-token
```

---

# Step 3: Create Domain Tools

Create `app/AiTools/Domain/` directory:

```bash
mkdir -p app/AiTools/Domain
```

## app/AiTools/Domain/BusinessTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Business;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class BusinessTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'business';
    }

    public function description(): string
    {
        return 'Search and analyze businesses. Actions: search, get, by_region, by_category, mentioned_in_news, without_opportunities.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['search', 'get', 'by_region', 'by_category', 'mentioned_in_news', 'without_opportunities'],
                'description' => 'Action to perform',
                'required' => true,
            ],
            'id' => [
                'type' => 'string',
                'description' => 'Business ID (for get)',
                'required' => false,
            ],
            'region_id' => [
                'type' => 'string',
                'description' => 'Filter by region',
                'required' => false,
            ],
            'category' => [
                'type' => 'string',
                'description' => 'Business category',
                'required' => false,
            ],
            'search' => [
                'type' => 'string',
                'description' => 'Search term',
                'required' => false,
            ],
            'limit' => [
                'type' => 'integer',
                'description' => 'Max results (default 20)',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'search' => $this->search($params),
            'get' => $this->get($params['id'] ?? ''),
            'by_region' => $this->byRegion($params['region_id'] ?? '', $params['limit'] ?? 20),
            'by_category' => $this->byCategory($params['category'] ?? '', $params['region_id'] ?? null, $params['limit'] ?? 20),
            'mentioned_in_news' => $this->mentionedInNews($params['region_id'] ?? null, $params['limit'] ?? 20),
            'without_opportunities' => $this->withoutOpportunities($params['region_id'] ?? null, $params['limit'] ?? 20),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function search(array $params): array
    {
        $query = Business::query();

        if (!empty($params['search'])) {
            $term = '%' . $params['search'] . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'ILIKE', $term)
                  ->orWhere('description', 'ILIKE', $term)
                  ->orWhere('address', 'ILIKE', $term);
            });
        }

        if (!empty($params['region_id'])) {
            $query->where('region_id', $params['region_id']);
        }

        if (!empty($params['category'])) {
            $query->where('category', $params['category']);
        }

        $businesses = $query->limit($params['limit'] ?? 20)->get();

        return [
            'count' => $businesses->count(),
            'businesses' => $businesses->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'category' => $b->category,
                'address' => $b->address,
                'region_id' => $b->region_id,
            ])->toArray(),
        ];
    }

    protected function get(string $id): array
    {
        $business = Business::with(['region'])->find($id);

        if (!$business) {
            return ['error' => true, 'message' => 'Business not found'];
        }

        return ['business' => $business->toArray()];
    }

    protected function byRegion(string $regionId, int $limit): array
    {
        $businesses = Business::where('region_id', $regionId)
            ->limit($limit)
            ->get(['id', 'name', 'category', 'address']);

        return ['count' => $businesses->count(), 'businesses' => $businesses->toArray()];
    }

    protected function byCategory(string $category, ?string $regionId, int $limit): array
    {
        $query = Business::where('category', $category);

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $businesses = $query->limit($limit)->get(['id', 'name', 'category', 'address', 'region_id']);

        return ['count' => $businesses->count(), 'businesses' => $businesses->toArray()];
    }

    protected function mentionedInNews(?string $regionId, int $limit): array
    {
        // Businesses that appear in articles
        $query = Business::whereHas('articleMentions');

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $businesses = $query->withCount('articleMentions')
            ->orderByDesc('article_mentions_count')
            ->limit($limit)
            ->get(['id', 'name', 'category']);

        return [
            'count' => $businesses->count(),
            'businesses' => $businesses->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'category' => $b->category,
                'mention_count' => $b->article_mentions_count,
            ])->toArray(),
        ];
    }

    protected function withoutOpportunities(?string $regionId, int $limit): array
    {
        // Businesses that don't have sales opportunities
        $query = Business::whereDoesntHave('opportunities');

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $businesses = $query->limit($limit)->get(['id', 'name', 'category', 'address']);

        return [
            'count' => $businesses->count(),
            'description' => 'Businesses without sales opportunities - potential leads',
            'businesses' => $businesses->toArray(),
        ];
    }
}
```

## app/AiTools/Domain/ArticleTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\DayNewsPost;
use App\Models\NewsArticleDraft;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class ArticleTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'article';
    }

    public function description(): string
    {
        return 'Work with articles and drafts. Actions: published, drafts, search, by_region, recent, needing_images.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['published', 'drafts', 'search', 'by_region', 'recent', 'needing_images'],
                'description' => 'Action to perform',
                'required' => true,
            ],
            'region_id' => [
                'type' => 'string',
                'required' => false,
            ],
            'search' => [
                'type' => 'string',
                'required' => false,
            ],
            'days' => [
                'type' => 'integer',
                'description' => 'Number of days back (for recent)',
                'required' => false,
            ],
            'limit' => [
                'type' => 'integer',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'published' => $this->getPublished($params),
            'drafts' => $this->getDrafts($params),
            'search' => $this->search($params['search'] ?? '', $params['limit'] ?? 20),
            'by_region' => $this->byRegion($params['region_id'] ?? '', $params['limit'] ?? 20),
            'recent' => $this->recent($params['days'] ?? 7, $params['region_id'] ?? null),
            'needing_images' => $this->needingImages($params['limit'] ?? 20),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function getPublished(array $params): array
    {
        $query = DayNewsPost::where('status', 'published');

        if (!empty($params['region_id'])) {
            $query->where('region_id', $params['region_id']);
        }

        $articles = $query->orderByDesc('published_at')
            ->limit($params['limit'] ?? 20)
            ->get(['id', 'title', 'excerpt', 'published_at', 'region_id']);

        return ['count' => $articles->count(), 'articles' => $articles->toArray()];
    }

    protected function getDrafts(array $params): array
    {
        $query = NewsArticleDraft::where('status', 'pending');

        if (!empty($params['region_id'])) {
            $query->where('region_id', $params['region_id']);
        }

        $drafts = $query->orderByDesc('created_at')
            ->limit($params['limit'] ?? 20)
            ->get(['id', 'title', 'status', 'quality_score', 'created_at']);

        return ['count' => $drafts->count(), 'drafts' => $drafts->toArray()];
    }

    protected function search(string $term, int $limit): array
    {
        $articles = DayNewsPost::where('title', 'ILIKE', "%{$term}%")
            ->orWhere('content', 'ILIKE', "%{$term}%")
            ->limit($limit)
            ->get(['id', 'title', 'excerpt', 'published_at']);

        return ['count' => $articles->count(), 'articles' => $articles->toArray()];
    }

    protected function byRegion(string $regionId, int $limit): array
    {
        $articles = DayNewsPost::where('region_id', $regionId)
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get(['id', 'title', 'excerpt', 'published_at']);

        return ['count' => $articles->count(), 'articles' => $articles->toArray()];
    }

    protected function recent(int $days, ?string $regionId): array
    {
        $query = DayNewsPost::where('status', 'published')
            ->where('published_at', '>=', now()->subDays($days));

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $articles = $query->orderByDesc('published_at')->limit(50)->get(['id', 'title', 'published_at']);

        return [
            'period' => "Last {$days} days",
            'count' => $articles->count(),
            'articles' => $articles->toArray(),
        ];
    }

    protected function needingImages(int $limit): array
    {
        $articles = DayNewsPost::where('status', 'published')
            ->whereNull('featured_image')
            ->limit($limit)
            ->get(['id', 'title', 'published_at']);

        return [
            'count' => $articles->count(),
            'description' => 'Published articles without featured images',
            'articles' => $articles->toArray(),
        ];
    }
}
```

## app/AiTools/Domain/PollTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Poll;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class PollTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'poll';
    }

    public function description(): string
    {
        return 'Work with polls. Actions: active, upcoming, results, by_region, calendar.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['active', 'upcoming', 'results', 'by_region', 'calendar'],
                'description' => 'Action to perform',
                'required' => true,
            ],
            'poll_id' => [
                'type' => 'string',
                'required' => false,
            ],
            'region_id' => [
                'type' => 'string',
                'required' => false,
            ],
            'limit' => [
                'type' => 'integer',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'active' => $this->getActive($params['region_id'] ?? null),
            'upcoming' => $this->getUpcoming($params['region_id'] ?? null, $params['limit'] ?? 10),
            'results' => $this->getResults($params['poll_id'] ?? ''),
            'by_region' => $this->byRegion($params['region_id'] ?? ''),
            'calendar' => $this->getCalendar($params['region_id'] ?? null),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function getActive(?string $regionId): array
    {
        $query = Poll::where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $polls = $query->withCount('votes')->get();

        return [
            'count' => $polls->count(),
            'polls' => $polls->map(fn($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'end_date' => $p->end_date->format('Y-m-d'),
                'votes_count' => $p->votes_count,
            ])->toArray(),
        ];
    }

    protected function getUpcoming(?string $regionId, int $limit): array
    {
        $query = Poll::where('start_date', '>', now());

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $polls = $query->orderBy('start_date')->limit($limit)->get();

        return [
            'count' => $polls->count(),
            'polls' => $polls->map(fn($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'start_date' => $p->start_date->format('Y-m-d'),
                'end_date' => $p->end_date->format('Y-m-d'),
            ])->toArray(),
        ];
    }

    protected function getResults(string $pollId): array
    {
        $poll = Poll::with(['options' => function ($q) {
            $q->withCount('votes');
        }])->find($pollId);

        if (!$poll) {
            return ['error' => true, 'message' => 'Poll not found'];
        }

        $totalVotes = $poll->options->sum('votes_count');

        return [
            'poll' => [
                'id' => $poll->id,
                'title' => $poll->title,
                'total_votes' => $totalVotes,
                'options' => $poll->options->map(fn($o) => [
                    'id' => $o->id,
                    'text' => $o->text,
                    'votes' => $o->votes_count,
                    'percentage' => $totalVotes > 0 ? round(($o->votes_count / $totalVotes) * 100, 1) : 0,
                ])->toArray(),
            ],
        ];
    }

    protected function byRegion(string $regionId): array
    {
        $polls = Poll::where('region_id', $regionId)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get(['id', 'title', 'status', 'start_date', 'end_date']);

        return ['count' => $polls->count(), 'polls' => $polls->toArray()];
    }

    protected function getCalendar(?string $regionId): array
    {
        // Get next 3 months of scheduled polls
        $query = Poll::whereBetween('start_date', [now(), now()->addMonths(3)]);

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $polls = $query->orderBy('start_date')->get(['id', 'title', 'start_date', 'end_date', 'category']);

        return [
            'period' => 'Next 3 months',
            'count' => $polls->count(),
            'calendar' => $polls->toArray(),
        ];
    }
}
```

## app/AiTools/Domain/OpportunityTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\SalesOpportunity;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class OpportunityTool extends BaseTool
{
    protected string $toolCategory = 'domain';
    protected bool $authRequired = true;

    public function name(): string
    {
        return 'opportunity';
    }

    public function description(): string
    {
        return 'Manage sales opportunities. Actions: list, create, update, by_business, high_priority.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['list', 'create', 'update', 'by_business', 'high_priority'],
                'description' => 'Action to perform',
                'required' => true,
            ],
            'id' => [
                'type' => 'string',
                'required' => false,
            ],
            'business_id' => [
                'type' => 'string',
                'required' => false,
            ],
            'data' => [
                'type' => 'array',
                'description' => 'Data for create/update',
                'required' => false,
            ],
            'status' => [
                'type' => 'enum',
                'enum' => ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
                'required' => false,
            ],
            'limit' => [
                'type' => 'integer',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'list' => $this->list($params),
            'create' => $this->create($params['data'] ?? []),
            'update' => $this->update($params['id'] ?? '', $params['data'] ?? []),
            'by_business' => $this->byBusiness($params['business_id'] ?? ''),
            'high_priority' => $this->highPriority($params['limit'] ?? 20),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function list(array $params): array
    {
        $query = SalesOpportunity::with('business');

        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        $opportunities = $query->orderByDesc('created_at')
            ->limit($params['limit'] ?? 20)
            ->get();

        return [
            'count' => $opportunities->count(),
            'opportunities' => $opportunities->map(fn($o) => [
                'id' => $o->id,
                'business_name' => $o->business?->name,
                'status' => $o->status,
                'value' => $o->estimated_value,
                'created_at' => $o->created_at->format('Y-m-d'),
            ])->toArray(),
        ];
    }

    protected function create(array $data): array
    {
        if (empty($data['business_id'])) {
            return ['error' => true, 'message' => 'business_id required'];
        }

        $opportunity = SalesOpportunity::create([
            'business_id' => $data['business_id'],
            'status' => $data['status'] ?? 'new',
            'source' => $data['source'] ?? 'ai_generated',
            'estimated_value' => $data['estimated_value'] ?? null,
            'notes' => $data['notes'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return [
            'success' => true,
            'opportunity' => [
                'id' => $opportunity->id,
                'business_id' => $opportunity->business_id,
                'status' => $opportunity->status,
            ],
        ];
    }

    protected function update(string $id, array $data): array
    {
        $opportunity = SalesOpportunity::find($id);

        if (!$opportunity) {
            return ['error' => true, 'message' => 'Opportunity not found'];
        }

        $updateable = ['status', 'estimated_value', 'notes', 'next_action', 'next_action_date'];
        $opportunity->update(array_intersect_key($data, array_flip($updateable)));

        return ['success' => true, 'updated' => true];
    }

    protected function byBusiness(string $businessId): array
    {
        $opportunities = SalesOpportunity::where('business_id', $businessId)
            ->orderByDesc('created_at')
            ->get();

        return ['count' => $opportunities->count(), 'opportunities' => $opportunities->toArray()];
    }

    protected function highPriority(int $limit): array
    {
        $opportunities = SalesOpportunity::whereIn('status', ['new', 'contacted', 'qualified'])
            ->where('estimated_value', '>=', 1000)
            ->orderByDesc('estimated_value')
            ->limit($limit)
            ->with('business')
            ->get();

        return [
            'count' => $opportunities->count(),
            'description' => 'High-value opportunities in active pipeline',
            'opportunities' => $opportunities->map(fn($o) => [
                'id' => $o->id,
                'business_name' => $o->business?->name,
                'status' => $o->status,
                'value' => $o->estimated_value,
            ])->toArray(),
        ];
    }
}
```

---

# Step 4: Register Tools

## app/Providers/AiToolsServiceProvider.php

```php
<?php

namespace App\Providers;

use App\AiTools\Domain\ArticleTool;
use App\AiTools\Domain\BusinessTool;
use App\AiTools\Domain\OpportunityTool;
use App\AiTools\Domain\PollTool;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Support\ServiceProvider;

class AiToolsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $registry = $this->app->make(ToolRegistry::class);

        // Register Day.News domain tools
        $registry->registerMany([
            new ArticleTool(),
            new BusinessTool(),
            new OpportunityTool(),
            new PollTool(),
        ]);
    }
}
```

Add to `config/app.php`:

```php
'providers' => [
    // ...
    App\Providers\AiToolsServiceProvider::class,
],
```

---

# Step 5: Create Test Command

## app/Console/Commands/AiQuery.php

```php
<?php

namespace App\Console\Commands;

use Fibonacco\AiToolsCore\Agent\AgentRunner;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Console\Command;

class AiQuery extends Command
{
    protected $signature = 'ai:query {question}';
    protected $description = 'Query using AI tools';

    public function handle(AgentRunner $agent, ToolRegistry $registry): int
    {
        $this->info('Available tools: ' . implode(', ', $registry->names()));
        $this->newLine();

        $question = $this->argument('question');
        $this->info("Question: {$question}");
        $this->newLine();

        $result = $agent->query($question);
        
        $this->line($result);

        return 0;
    }
}
```

Test it:

```bash
php artisan ai:query "How many businesses are in Clearwater?"
php artisan ai:query "Show me articles published this week"
php artisan ai:query "Find businesses mentioned in news that don't have opportunities"
```

---

# Step 6: Using the Gateway Client

For cross-platform queries:

```php
<?php

use Fibonacco\AiGatewayClient\AiGatewayClient;

class SomeController extends Controller
{
    public function crossPlatformQuery(AiGatewayClient $gateway)
    {
        // Query across all platforms
        $result = $gateway->query(
            "Find businesses in Day.News that have overdue tasks in TaskJuggler"
        );

        return response()->json($result);
    }

    public function createTasksForArticles(AiGatewayClient $gateway)
    {
        // Create tasks in TaskJuggler from Day.News
        $result = $gateway->agent(
            prompt: "Create TaskJuggler tasks for all Day.News articles that need images",
            tools: ['platform_database', 'taskjuggler_api']
        );

        return response()->json($result);
    }
}
```

---

# Checklist

- [ ] Installed `fibonacco/ai-tools-core`
- [ ] Installed `fibonacco/ai-gateway-client`
- [ ] Published and configured `config/ai-tools-core.php`
- [ ] Published and configured `config/ai-gateway-client.php`
- [ ] Created domain tools:
  - [ ] BusinessTool
  - [ ] ArticleTool
  - [ ] PollTool
  - [ ] OpportunityTool
- [ ] Created AiToolsServiceProvider
- [ ] Registered provider in config/app.php
- [ ] Created test command
- [ ] Tested local queries
- [ ] Tested gateway connection (if gateway deployed)

---

# What You Can Now Do

## Local AI (Day.News only)

```php
// Search businesses
$agent->query("Find restaurants in Clearwater");

// Analyze articles
$agent->query("How many articles were published this week?");

// Find opportunities
$agent->query("Show businesses mentioned in news without sales opportunities");
```

## Cross-Platform AI (via Gateway)

```php
// Query multiple platforms
$gateway->query("Find businesses that appear in Day.News but have no tasks in TaskJuggler");

// Create cross-platform actions
$gateway->agent("Create tasks for articles needing images", ['platform_database', 'taskjuggler_api']);
```

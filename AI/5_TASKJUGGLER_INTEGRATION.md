# TaskJuggler AI Integration Guide

**Document:** 5 of 6  
**For:** TaskJuggler development team / Antigravity  
**Time:** 1 day

---

# What You're Doing

1. Install shared packages
2. Configure for TaskJuggler database
3. Build TaskJuggler-specific domain tools
4. Create API endpoints for Gateway to call
5. Connect to AI Gateway for cross-platform queries

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
    'platform' => 'taskjuggler',

    'default_model' => [
        env('AI_TOOLS_PROVIDER', 'openrouter'),
        env('AI_TOOLS_MODEL', 'anthropic/claude-3-sonnet'),
    ],

    'timeout' => 120,

    'tables' => [
        'allowed' => [
            // Projects & Tasks
            'projects',
            'tasks',
            'subtasks',
            
            // Teams
            'teams',
            'team_members',
            'users',
            
            // Time tracking
            'time_entries',
            
            // Collaboration
            'comments',
            'attachments',
            
            // Workflows
            'workflows',
            'workflow_steps',
            
            // Resources
            'resources',
            'allocations',
        ],

        'writable' => [
            'tasks',
            'subtasks',
            'time_entries',
            'comments',
        ],

        'excluded_columns' => [
            'password',
            'remember_token',
            'api_token',
        ],

        'searchable' => [
            'tasks' => ['title', 'description'],
            'projects' => ['name', 'description'],
            'teams' => ['name'],
            'users' => ['name', 'email'],
            'comments' => ['content'],
        ],
    ],
];
```

## .env additions

```env
AI_TOOLS_PLATFORM=taskjuggler
AI_GATEWAY_URL=https://ai-gateway.fibonacco.com
AI_GATEWAY_TOKEN=your-taskjuggler-gateway-token
```

---

# Step 3: Create Domain Tools

```bash
mkdir -p app/AiTools/Domain
```

## app/AiTools/Domain/TaskTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Task;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class TaskTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'task';
    }

    public function description(): string
    {
        return 'Manage tasks. Actions: list, get, create, update, complete, assign, search, overdue, my_tasks, by_project.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['list', 'get', 'create', 'update', 'complete', 'assign', 'search', 'overdue', 'my_tasks', 'by_project'],
                'required' => true,
            ],
            'id' => ['type' => 'string', 'required' => false],
            'project_id' => ['type' => 'string', 'required' => false],
            'assignee_id' => ['type' => 'string', 'required' => false],
            'status' => [
                'type' => 'enum',
                'enum' => ['pending', 'in_progress', 'review', 'completed', 'blocked'],
                'required' => false,
            ],
            'priority' => [
                'type' => 'enum',
                'enum' => ['low', 'medium', 'high', 'urgent'],
                'required' => false,
            ],
            'title' => ['type' => 'string', 'required' => false],
            'description' => ['type' => 'string', 'required' => false],
            'due_date' => ['type' => 'string', 'description' => 'YYYY-MM-DD format', 'required' => false],
            'search' => ['type' => 'string', 'required' => false],
            'limit' => ['type' => 'integer', 'required' => false],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'list' => $this->listTasks($params),
            'get' => $this->getTask($params['id'] ?? ''),
            'create' => $this->createTask($params),
            'update' => $this->updateTask($params),
            'complete' => $this->completeTask($params['id'] ?? ''),
            'assign' => $this->assignTask($params['id'] ?? '', $params['assignee_id'] ?? ''),
            'search' => $this->searchTasks($params['search'] ?? '', $params['limit'] ?? 20),
            'overdue' => $this->getOverdueTasks($params),
            'my_tasks' => $this->getMyTasks($params),
            'by_project' => $this->getByProject($params['project_id'] ?? '', $params),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function listTasks(array $params): array
    {
        $query = Task::with(['project', 'assignee']);

        if (!empty($params['project_id'])) {
            $query->where('project_id', $params['project_id']);
        }
        if (!empty($params['assignee_id'])) {
            $query->where('assignee_id', $params['assignee_id']);
        }
        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }
        if (!empty($params['priority'])) {
            $query->where('priority', $params['priority']);
        }

        $tasks = $query->orderBy('due_date')
            ->limit($params['limit'] ?? 20)
            ->get();

        return [
            'count' => $tasks->count(),
            'tasks' => $tasks->map(fn($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'status' => $t->status,
                'priority' => $t->priority,
                'due_date' => $t->due_date?->format('Y-m-d'),
                'assignee' => $t->assignee?->name,
                'project' => $t->project?->name,
            ])->toArray(),
        ];
    }

    protected function getTask(string $id): array
    {
        $task = Task::with(['project', 'assignee', 'comments', 'subtasks'])->find($id);
        
        if (!$task) {
            return ['error' => true, 'message' => 'Task not found'];
        }

        return ['task' => $task->toArray()];
    }

    protected function createTask(array $params): array
    {
        if (empty($params['title'])) {
            return ['error' => true, 'message' => 'title required'];
        }

        $task = Task::create([
            'title' => $params['title'],
            'description' => $params['description'] ?? null,
            'project_id' => $params['project_id'] ?? null,
            'assignee_id' => $params['assignee_id'] ?? auth()->id(),
            'status' => $params['status'] ?? 'pending',
            'priority' => $params['priority'] ?? 'medium',
            'due_date' => $params['due_date'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return [
            'success' => true,
            'task' => ['id' => $task->id, 'title' => $task->title],
        ];
    }

    protected function updateTask(array $params): array
    {
        $task = Task::find($params['id'] ?? '');
        
        if (!$task) {
            return ['error' => true, 'message' => 'Task not found'];
        }

        $updateable = ['title', 'description', 'status', 'priority', 'due_date', 'assignee_id', 'project_id'];
        $data = array_intersect_key($params, array_flip($updateable));

        $task->update($data);

        return ['success' => true, 'updated' => array_keys($data)];
    }

    protected function completeTask(string $id): array
    {
        $task = Task::find($id);
        
        if (!$task) {
            return ['error' => true, 'message' => 'Task not found'];
        }

        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by' => auth()->id(),
        ]);

        return ['success' => true, 'task_id' => $id, 'status' => 'completed'];
    }

    protected function assignTask(string $id, string $assigneeId): array
    {
        $task = Task::find($id);
        
        if (!$task) {
            return ['error' => true, 'message' => 'Task not found'];
        }

        $task->update(['assignee_id' => $assigneeId]);

        return ['success' => true, 'task_id' => $id, 'assignee_id' => $assigneeId];
    }

    protected function searchTasks(string $term, int $limit): array
    {
        $tasks = Task::where('title', 'ILIKE', "%{$term}%")
            ->orWhere('description', 'ILIKE', "%{$term}%")
            ->limit($limit)
            ->get(['id', 'title', 'status', 'priority', 'due_date']);

        return ['count' => $tasks->count(), 'tasks' => $tasks->toArray()];
    }

    protected function getOverdueTasks(array $params): array
    {
        $query = Task::where('due_date', '<', now())
            ->whereNotIn('status', ['completed']);

        if (!empty($params['assignee_id'])) {
            $query->where('assignee_id', $params['assignee_id']);
        }
        if (!empty($params['project_id'])) {
            $query->where('project_id', $params['project_id']);
        }

        $tasks = $query->orderBy('due_date')
            ->limit($params['limit'] ?? 20)
            ->with(['project', 'assignee'])
            ->get();

        return [
            'count' => $tasks->count(),
            'description' => 'Overdue tasks',
            'tasks' => $tasks->map(fn($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'due_date' => $t->due_date->format('Y-m-d'),
                'days_overdue' => $t->due_date->diffInDays(now()),
                'assignee' => $t->assignee?->name,
                'project' => $t->project?->name,
            ])->toArray(),
        ];
    }

    protected function getMyTasks(array $params): array
    {
        $params['assignee_id'] = auth()->id();
        return $this->listTasks($params);
    }

    protected function getByProject(string $projectId, array $params): array
    {
        $params['project_id'] = $projectId;
        return $this->listTasks($params);
    }
}
```

## app/AiTools/Domain/ProjectTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Project;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class ProjectTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'project';
    }

    public function description(): string
    {
        return 'Manage projects. Actions: list, get, create, stats, active.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['list', 'get', 'create', 'stats', 'active'],
                'required' => true,
            ],
            'id' => ['type' => 'string', 'required' => false],
            'name' => ['type' => 'string', 'required' => false],
            'description' => ['type' => 'string', 'required' => false],
            'team_id' => ['type' => 'string', 'required' => false],
            'limit' => ['type' => 'integer', 'required' => false],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'list' => $this->listProjects($params),
            'get' => $this->getProject($params['id'] ?? ''),
            'create' => $this->createProject($params),
            'stats' => $this->getStats($params['id'] ?? ''),
            'active' => $this->getActive($params['limit'] ?? 20),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function listProjects(array $params): array
    {
        $query = Project::withCount(['tasks', 'tasks as completed_tasks_count' => function ($q) {
            $q->where('status', 'completed');
        }]);

        if (!empty($params['team_id'])) {
            $query->where('team_id', $params['team_id']);
        }

        $projects = $query->limit($params['limit'] ?? 20)->get();

        return [
            'count' => $projects->count(),
            'projects' => $projects->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'status' => $p->status,
                'tasks_count' => $p->tasks_count,
                'completed_tasks_count' => $p->completed_tasks_count,
                'progress' => $p->tasks_count > 0 
                    ? round(($p->completed_tasks_count / $p->tasks_count) * 100) 
                    : 0,
            ])->toArray(),
        ];
    }

    protected function getProject(string $id): array
    {
        $project = Project::with(['team', 'tasks'])->find($id);
        
        if (!$project) {
            return ['error' => true, 'message' => 'Project not found'];
        }

        return ['project' => $project->toArray()];
    }

    protected function createProject(array $params): array
    {
        if (empty($params['name'])) {
            return ['error' => true, 'message' => 'name required'];
        }

        $project = Project::create([
            'name' => $params['name'],
            'description' => $params['description'] ?? null,
            'team_id' => $params['team_id'] ?? null,
            'status' => 'active',
            'created_by' => auth()->id(),
        ]);

        return ['success' => true, 'project' => ['id' => $project->id, 'name' => $project->name]];
    }

    protected function getStats(string $id): array
    {
        $project = Project::withCount([
            'tasks',
            'tasks as pending_count' => fn($q) => $q->where('status', 'pending'),
            'tasks as in_progress_count' => fn($q) => $q->where('status', 'in_progress'),
            'tasks as completed_count' => fn($q) => $q->where('status', 'completed'),
            'tasks as overdue_count' => fn($q) => $q->where('due_date', '<', now())->whereNot('status', 'completed'),
        ])->find($id);

        if (!$project) {
            return ['error' => true, 'message' => 'Project not found'];
        }

        return [
            'project' => $project->name,
            'stats' => [
                'total_tasks' => $project->tasks_count,
                'pending' => $project->pending_count,
                'in_progress' => $project->in_progress_count,
                'completed' => $project->completed_count,
                'overdue' => $project->overdue_count,
                'completion_rate' => $project->tasks_count > 0 
                    ? round(($project->completed_count / $project->tasks_count) * 100, 1) 
                    : 0,
            ],
        ];
    }

    protected function getActive(int $limit): array
    {
        $projects = Project::where('status', 'active')
            ->withCount('tasks')
            ->limit($limit)
            ->get(['id', 'name', 'created_at']);

        return ['count' => $projects->count(), 'projects' => $projects->toArray()];
    }
}
```

## app/AiTools/Domain/TeamTool.php

```php
<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Team;
use App\Models\User;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class TeamTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'team';
    }

    public function description(): string
    {
        return 'Manage teams and members. Actions: list, get, members, workload.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['list', 'get', 'members', 'workload'],
                'required' => true,
            ],
            'id' => ['type' => 'string', 'required' => false],
            'limit' => ['type' => 'integer', 'required' => false],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'list' => $this->listTeams($params['limit'] ?? 20),
            'get' => $this->getTeam($params['id'] ?? ''),
            'members' => $this->getMembers($params['id'] ?? ''),
            'workload' => $this->getWorkload($params['id'] ?? ''),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function listTeams(int $limit): array
    {
        $teams = Team::withCount('members')->limit($limit)->get(['id', 'name']);

        return ['count' => $teams->count(), 'teams' => $teams->toArray()];
    }

    protected function getTeam(string $id): array
    {
        $team = Team::with('members')->find($id);
        
        if (!$team) {
            return ['error' => true, 'message' => 'Team not found'];
        }

        return ['team' => $team->toArray()];
    }

    protected function getMembers(string $id): array
    {
        $team = Team::with('members')->find($id);
        
        if (!$team) {
            return ['error' => true, 'message' => 'Team not found'];
        }

        return [
            'team' => $team->name,
            'members' => $team->members->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
            ])->toArray(),
        ];
    }

    protected function getWorkload(string $id): array
    {
        $team = Team::find($id);
        
        if (!$team) {
            return ['error' => true, 'message' => 'Team not found'];
        }

        $members = $team->members()->withCount([
            'assignedTasks',
            'assignedTasks as pending_count' => fn($q) => $q->whereNot('status', 'completed'),
            'assignedTasks as overdue_count' => fn($q) => $q->where('due_date', '<', now())->whereNot('status', 'completed'),
        ])->get();

        return [
            'team' => $team->name,
            'workload' => $members->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'total_tasks' => $m->assigned_tasks_count,
                'pending_tasks' => $m->pending_count,
                'overdue_tasks' => $m->overdue_count,
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

use App\AiTools\Domain\TaskTool;
use App\AiTools\Domain\ProjectTool;
use App\AiTools\Domain\TeamTool;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Support\ServiceProvider;

class AiToolsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $registry = $this->app->make(ToolRegistry::class);

        $registry->registerMany([
            new TaskTool(),
            new ProjectTool(),
            new TeamTool(),
        ]);
    }
}
```

---

# Step 5: Create API Endpoints for Gateway

The AI Gateway needs to call TaskJuggler's API for write operations.

## routes/api.php

```php
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    // Tasks
    Route::post('/tasks', [TaskApiController::class, 'store']);
    Route::put('/tasks/{id}', [TaskApiController::class, 'update']);
    Route::post('/tasks/{id}/complete', [TaskApiController::class, 'complete']);
    Route::post('/tasks/{id}/assign', [TaskApiController::class, 'assign']);
    
    // Projects
    Route::post('/projects', [ProjectApiController::class, 'store']);
    
    // Time entries
    Route::post('/time-entries', [TimeEntryApiController::class, 'store']);
});
```

## app/Http/Controllers/Api/TaskApiController.php

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskApiController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'nullable|uuid|exists:projects,id',
            'assignee_id' => 'nullable|uuid|exists:users,id',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'workflow_id' => 'nullable|string', // For tracking gateway workflows
        ]);

        $task = Task::create([
            ...$validated,
            'status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'task' => $task->only(['id', 'title', 'status']),
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,review,completed,blocked',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'assignee_id' => 'nullable|uuid|exists:users,id',
        ]);

        $task->update($validated);

        return response()->json(['success' => true, 'task' => $task]);
    }

    public function complete(string $id)
    {
        $task = Task::findOrFail($id);

        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json(['success' => true, 'task' => $task]);
    }

    public function assign(Request $request, string $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'assignee_id' => 'required|uuid|exists:users,id',
        ]);

        $task->update($validated);

        return response()->json(['success' => true, 'task' => $task]);
    }
}
```

---

# Step 6: Create Gateway API Token

```bash
php artisan tinker

> $user = User::create(['name' => 'AI Gateway', 'email' => 'gateway@fibonacco.com', 'password' => bcrypt('xxx')]);
> $user->createToken('ai-gateway')->plainTextToken;
```

Give this token to the Gateway admin to put in their `TASKJUGGLER_API_TOKEN` env var.

---

# Checklist

- [ ] Installed packages
- [ ] Configured `config/ai-tools-core.php`
- [ ] Created domain tools (TaskTool, ProjectTool, TeamTool)
- [ ] Registered tools in ServiceProvider
- [ ] Created API endpoints for Gateway
- [ ] Created Gateway API token
- [ ] Tested local queries
- [ ] Tested Gateway connection

---

# What You Can Now Do

```php
// Local queries
$agent->query("Show me all overdue tasks");
$agent->query("What's the workload for Team Alpha?");
$agent->query("Find tasks assigned to me");

// Cross-platform via Gateway
$gateway->query("Find Day.News articles that need tasks created");
$gateway->agent("Create tasks for articles needing images", ['platform_database', 'taskjuggler_api']);
```

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\StoreTaskRequest;
use App\Http\Requests\Api\V1\UpdateTaskRequest;
use App\Http\Resources\Api\V1\Crm\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TaskController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Task::query()->with(['tenant', 'customer', 'assignedTo']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('assigned_to_id')) {
            $query->where('assigned_to_id', $request->assigned_to_id);
        }

        $tasks = $query->orderBy('due_date')->paginate($request->get('per_page', 20));

        return $this->paginated($tasks);
    }

    public function show(Task $task): JsonResponse
    {
        return $this->success(new TaskResource($task->load(['tenant', 'customer', 'assignedTo'])));
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = Task::create($request->validated());
        return $this->success(new TaskResource($task), 'Task created successfully', 201);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);
        $task->update($request->validated());
        return $this->success(new TaskResource($task), 'Task updated successfully');
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);
        $task->delete();
        return $this->noContent();
    }

    public function complete(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);
        $task->update(['status' => 'completed', 'completed_at' => now()]);
        return $this->success(new TaskResource($task), 'Task completed successfully');
    }

    public function assign(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);
        $request->validate(['assigned_to_id' => ['required', 'uuid', 'exists:users,id']]);
        $task->update(['assigned_to_id' => $request->assigned_to_id]);
        return $this->success(new TaskResource($task), 'Task assigned successfully');
    }

    public function byCustomer(string $customerId): JsonResponse
    {
        $tasks = Task::where('customer_id', $customerId)->orderBy('due_date')->get();
        return $this->success(TaskResource::collection($tasks));
    }

    public function byUser(string $userId): JsonResponse
    {
        $tasks = Task::where('assigned_to_id', $userId)->orderBy('due_date')->get();
        return $this->success(TaskResource::collection($tasks));
    }
}



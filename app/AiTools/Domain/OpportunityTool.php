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
         // Assuming 'qualified' or 'proposal' status implies high priority or based on value
        $opportunities = SalesOpportunity::whereIn('status', ['qualified', 'proposal'])
            ->orderByDesc('estimated_value')
            ->limit($limit)
            ->get();

        return ['count' => $opportunities->count(), 'opportunities' => $opportunities->toArray()];
    }
}

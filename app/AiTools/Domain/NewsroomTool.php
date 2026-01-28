<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Influencer;
use App\Models\CommunityLog;
use App\Models\Region;
use App\Newsroom\Intelligence\QuotePursuitManager;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class NewsroomTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'newsroom';
    }

    public function description(): string
    {
        return 'Access Newsroom Intelligence. Actions: find_influencers, log_history, pursue_quote, get_history.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['find_influencers', 'log_history', 'pursue_quote', 'get_history'],
                'required' => true,
            ],
            'region_id' => ['type' => 'string', 'required' => false],
            'topic' => ['type' => 'string', 'required' => false],
            'thread_id' => ['type' => 'string', 'required' => false],
            'title' => ['type' => 'string', 'required' => false],
            'angle' => ['type' => 'string', 'required' => false],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'find_influencers' => $this->findInfluencers($params),
            'get_history' => $this->getHistory($params),
            'pursue_quote' => $this->pursueQuote($params),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function findInfluencers(array $params): array
    {
        $query = Influencer::query();

        if (!empty($params['region_id'])) {
            $query->where('region_id', $params['region_id']);
        }

        $influencers = $query->limit(5)->get();

        return [
            'count' => $influencers->count(),
            'influencers' => $influencers->map(fn($i) => [
                'id' => $i->id,
                'name' => $i->name,
                'role' => $i->role,
                'score' => $i->influence_score,
            ])->toArray(),
        ];
    }

    protected function getHistory(array $params): array
    {
        $query = CommunityLog::query();

        if (!empty($params['region_id'])) {
            $query->where('region_id', $params['region_id']);
        }

        $logs = $query->orderByDesc('occurred_at')->limit(10)->get();

        return [
            'count' => $logs->count(),
            'logs' => $logs->map(fn($l) => [
                'title' => $l->title,
                'summary' => $l->summary,
                'date' => $l->occurred_at->format('Y-m-d'),
                'type' => $l->event_type,
            ])->toArray(),
        ];
    }

    protected function pursueQuote(array $params): array
    {
        // This connects to the Newsroom internal service
        if (empty($params['thread_id']) || empty($params['angle'])) {
            return ['error' => true, 'message' => 'thread_id and angle required'];
        }

        // We need to resolve the Thread model. In a real app we'd inject the Manager.
        $thread = \App\Models\StoryThread::find($params['thread_id']);
        if (!$thread) {
            return ['error' => true, 'message' => 'Story Thread not found'];
        }

        // Resolve the service from the container
        $manager = app(QuotePursuitManager::class);
        $manager->pursueQuote($thread, $params['angle']);

        return ['success' => true, 'message' => 'Quote pursuit initiated'];
    }
}

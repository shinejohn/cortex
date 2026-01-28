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
        $poll = Poll::with([
            'options' => function ($q) {
                $q->withCount('votes');
            }
        ])->find($pollId);

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

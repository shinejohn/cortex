<?php

declare(strict_types=1);

namespace App\Services\WriterAgent;

use App\Models\Region;
use App\Models\WriterAgent;
use Illuminate\Support\Facades\Log;

final class AgentAssignmentService
{
    /**
     * Find the best agent for a given region and category.
     * Prefers agents with fewer recent articles for load balancing.
     */
    public function findBestAgent(Region $region, string $category): ?WriterAgent
    {
        $agent = WriterAgent::active()
            ->forRegion($region->id)
            ->forCategory($category)
            ->orderBy('articles_count', 'asc')
            ->first();

        if ($agent) {
            Log::debug('Found matching agent for region and category', [
                'agent_id' => $agent->id,
                'agent_name' => $agent->name,
                'region' => $region->name,
                'category' => $category,
            ]);

            return $agent;
        }

        // Fallback: Try to find an agent that covers the region regardless of category
        $agent = WriterAgent::active()
            ->forRegion($region->id)
            ->orderBy('articles_count', 'asc')
            ->first();

        if ($agent) {
            Log::debug('Found fallback agent for region (category not matched)', [
                'agent_id' => $agent->id,
                'agent_name' => $agent->name,
                'region' => $region->name,
                'category' => $category,
            ]);

            return $agent;
        }

        // Last resort: Any active agent with the category
        $agent = WriterAgent::active()
            ->forCategory($category)
            ->orderBy('articles_count', 'asc')
            ->first();

        if ($agent) {
            Log::debug('Found fallback agent for category (region not matched)', [
                'agent_id' => $agent->id,
                'agent_name' => $agent->name,
                'region' => $region->name,
                'category' => $category,
            ]);

            return $agent;
        }

        Log::warning('No suitable agent found', [
            'region' => $region->name,
            'category' => $category,
        ]);

        return null;
    }

    /**
     * Find any active agent as a last resort fallback.
     */
    public function findAnyAgent(): ?WriterAgent
    {
        return WriterAgent::active()
            ->orderBy('articles_count', 'asc')
            ->first();
    }

    /**
     * Increment the article count for an agent.
     */
    public function incrementArticleCount(WriterAgent $agent): void
    {
        $agent->increment('articles_count');
    }
}

<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\Performer;
use App\Models\Workspace;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class PerformerMatchingService
{
    /**
     * Match existing performer or create new one
     */
    public function matchOrCreate(?string $performerName): ?Performer
    {
        if (empty($performerName)) {
            return null;
        }

        // Try to find existing performer
        $performer = $this->findMatchingPerformer($performerName);

        if ($performer) {
            Log::info('PerformerMatchingService: Found matching performer', [
                'performer_id' => $performer->id,
                'performer_name' => $performer->name,
                'searched_name' => $performerName,
            ]);

            return $performer;
        }

        // Create new performer under system workspace
        return $this->createPerformer($performerName);
    }

    /**
     * Search performers by query for autocomplete. Returns array of matches.
     *
     * @return array<int, array{id: string, name: string, home_city: string|null}>
     */
    public function findPerformer(string $query, ?\App\Models\Region $region = null): array
    {
        if (mb_strlen(mb_trim($query)) < 2) {
            return [];
        }

        $search = '%'.Str::lower(mb_trim($query)).'%';
        $performers = Performer::query()
            ->whereRaw('LOWER(name) LIKE ?', [$search])
            ->where('status', 'active')
            ->limit(10)
            ->get(['id', 'name', 'home_city']);

        return $performers->map(fn (Performer $p) => [
            'id' => $p->id,
            'name' => $p->name,
            'home_city' => $p->home_city,
        ])->toArray();
    }

    /**
     * Find matching performer using name matching
     */
    private function findMatchingPerformer(string $performerName): ?Performer
    {
        $threshold = config('news-workflow.event_extraction.performer_match_threshold', 0.85);

        // First try exact match (case-insensitive)
        $performer = Performer::whereRaw('LOWER(name) = ?', [Str::lower($performerName)])->first();

        if ($performer) {
            return $performer;
        }

        // Try fuzzy match against existing performers
        $performers = Performer::all();
        $bestMatch = null;
        $bestSimilarity = 0;

        foreach ($performers as $candidate) {
            $similarity = $this->calculateSimilarity($performerName, $candidate->name);

            if ($similarity >= $threshold && $similarity > $bestSimilarity) {
                $bestMatch = $candidate;
                $bestSimilarity = $similarity;
            }
        }

        if ($bestMatch) {
            Log::info('PerformerMatchingService: Fuzzy matched performer', [
                'performer_id' => $bestMatch->id,
                'performer_name' => $bestMatch->name,
                'searched_name' => $performerName,
                'similarity' => $bestSimilarity,
            ]);
        }

        return $bestMatch;
    }

    /**
     * Create new performer under system workspace
     */
    private function createPerformer(string $performerName): Performer
    {
        $systemWorkspace = $this->getSystemWorkspace();

        $performer = Performer::create([
            'name' => $performerName,
            'genres' => [],
            'home_city' => 'Unknown',
            'status' => 'active',
            'workspace_id' => $systemWorkspace->id,
        ]);

        Log::info('PerformerMatchingService: Created new performer', [
            'performer_id' => $performer->id,
            'performer_name' => $performer->name,
        ]);

        return $performer;
    }

    /**
     * Calculate Levenshtein-based similarity score (0-1)
     */
    private function calculateSimilarity(string $str1, string $str2): float
    {
        $str1 = Str::lower(mb_trim($str1));
        $str2 = Str::lower(mb_trim($str2));

        // Exact match
        if ($str1 === $str2) {
            return 1.0;
        }

        // Check if one contains the other
        if (str_contains($str1, $str2) || str_contains($str2, $str1)) {
            return 0.9;
        }

        // Levenshtein distance
        $levenshtein = levenshtein($str1, $str2);
        $maxLen = max(mb_strlen($str1), mb_strlen($str2));

        if ($maxLen === 0) {
            return 1.0;
        }

        return 1 - ($levenshtein / $maxLen);
    }

    /**
     * Get or create system workspace
     */
    private function getSystemWorkspace(): Workspace
    {
        $workspaceId = config('news-workflow.event_extraction.system_workspace_id');

        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if ($workspace) {
                return $workspace;
            }
        }

        $workspaceName = config('news-workflow.event_extraction.system_workspace_name', 'AI Event Extraction');

        return Workspace::firstOrCreate(
            ['name' => $workspaceName],
            ['slug' => Str::slug($workspaceName)]
        );
    }
}

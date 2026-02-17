<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\Region;
use App\Services\News\PrismAiService;
use Exception;
use Illuminate\Support\Facades\Log;

final class LocalFlavorEngine
{
    public function __construct(
        private readonly PrismAiService $ai,
    ) {}

    /**
     * Enrich AI-generated article content with local context.
     * Called from ArticleGenerationService during Phase 6 before finalizing.
     *
     * Adds: neighborhood names, landmark references, community history where appropriate.
     */
    public function enrich(string $content, Region $region, string $articleTitle = ''): string
    {
        if (! config('news-workflow.business_content.local_flavor_enabled', true)) {
            return $content;
        }

        try {
            $prompt = $this->buildEnrichmentPrompt($content, $region, $articleTitle);
            $result = $this->ai->generateJson($prompt, [
                'type' => 'object',
                'properties' => [
                    'enriched_content' => ['type' => 'string'],
                    'changes_made' => [
                        'type' => 'array',
                        'items' => ['type' => 'string'],
                    ],
                ],
                'required' => ['enriched_content'],
            ]);

            $enriched = $result['enriched_content'] ?? $content;
            if (is_string($enriched) && mb_strlen($enriched) > 100) {
                return $enriched;
            }

            return $content;
        } catch (Exception $e) {
            Log::warning('LocalFlavorEngine: Enrichment failed', [
                'region_id' => $region->id,
                'error' => $e->getMessage(),
            ]);

            return $content;
        }
    }

    private function buildEnrichmentPrompt(string $content, Region $region, string $articleTitle): string
    {
        $regionContext = $this->gatherRegionContext($region);

        return <<<PROMPT
You are a local journalism expert. Enrich this article with subtle local flavor for {$region->name}.

Article title: {$articleTitle}

Current content (HTML):
{$content}

Local context to draw from:
{$regionContext}

Instructions:
- Add 1-3 subtle references to local landmarks, neighborhoods, or community history WHERE they naturally fit
- Do NOT force references where they don't belong
- Preserve all existing facts, quotes, and structure
- Keep the same HTML formatting
- If the article is already well-localized, return it with minimal or no changes
- Never invent facts - only add general local color (e.g., "in the historic downtown" if applicable)

Respond with JSON only:
{"enriched_content": "full HTML content with local flavor", "changes_made": ["brief description of changes"]}
PROMPT;
    }

    private function gatherRegionContext(Region $region): string
    {
        $parts = [
            "Region: {$region->name}",
            "Type: {$region->type}",
        ];

        if ($region->description) {
            $parts[] = "Description: {$region->description}";
        }

        if ($region->metadata && is_array($region->metadata)) {
            $neighborhoods = $region->metadata['neighborhoods'] ?? $region->metadata['neighborhood_names'] ?? null;
            if ($neighborhoods) {
                $parts[] = 'Neighborhoods: '.implode(', ', (array) $neighborhoods);
            }
            $landmarks = $region->metadata['landmarks'] ?? $region->metadata['notable_places'] ?? null;
            if ($landmarks) {
                $parts[] = 'Landmarks: '.implode(', ', (array) $landmarks);
            }
        }

        $parts[] = 'Full name: '.$region->full_name;

        return implode("\n", $parts);
    }
}

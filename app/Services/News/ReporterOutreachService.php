<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\CommunityLeader;
use App\Models\NewsArticleDraft;
use App\Models\QuoteRequest;
use Exception;
use Illuminate\Support\Facades\Log;

final class ReporterOutreachService
{
    public function __construct(
        private readonly PrismAiService $aiService,
    ) {}

    /**
     * Find relevant leaders for an article and generate outreach.
     *
     * @return array{QuoteRequest}
     */
    public function seekSourcesForArticle(NewsArticleDraft $draft): array
    {
        $regionId = $draft->region_id;
        $topic = $draft->category ?? 'general';

        $leaders = CommunityLeader::where('region_id', $regionId)
            ->contactable()
            ->where(function ($q) use ($topic) {
                $q->whereJsonContains('expertise_topics', $topic)
                    ->orWhere('category', 'government_official');
            })
            ->orderByDesc('influence_score')
            ->limit(3)
            ->get();

        $requests = [];
        foreach ($leaders as $leader) {
            $questions = $this->generateQuestions($draft, $leader);

            $request = QuoteRequest::create([
                'leader_id' => $leader->id,
                'news_article_draft_id' => $draft->id,
                'status' => 'pending',
                'contact_method' => $leader->preferred_contact_method,
                'context' => "Article: {$draft->title}",
                'questions' => $questions,
                'expires_at' => now()->addHours(48),
            ]);

            $requests[] = $request;

            Log::info('ReporterOutreach: Quote request created', [
                'leader' => $leader->name,
                'article' => $draft->title,
            ]);
        }

        return $requests;
    }

    private function generateQuestions(NewsArticleDraft $draft, CommunityLeader $leader): string
    {
        try {
            if (method_exists($this->aiService, 'generateJson')) {
                $prompt = "Generate 2-3 brief interview questions for {$leader->name} ({$leader->title} at {$leader->organization}) about: {$draft->title}. Keep questions concise and relevant to their expertise. Return as JSON with a 'questions' array of strings.";
                $schema = [
                    'type' => 'object',
                    'properties' => [
                        'questions' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                        ],
                    ],
                    'required' => ['questions'],
                ];
                $result = $this->aiService->generateJson($prompt, $schema);
                $questions = $result['questions'] ?? [];

                return implode("\n", array_map(fn ($q, $i) => ($i + 1).'. '.$q, $questions, array_keys($questions)));
            }
        } catch (Exception $e) {
            Log::warning('ReporterOutreach: AI question generation failed', [
                'leader' => $leader->name,
                'error' => $e->getMessage(),
            ]);
        }

        return "1. What is your perspective on this development?\n2. How does this affect the community?";
    }
}

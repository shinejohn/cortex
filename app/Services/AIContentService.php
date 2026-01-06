<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Community;
use App\Services\AIService;
use Illuminate\Support\Facades\Log;

final class AIContentService
{
    public function __construct(
        private readonly AIService $aiService
    ) {}

    /**
     * Generate digest content using AI
     */
    public function generateDigestContent(Community $community, array $content): array
    {
        $prompt = $this->buildDigestPrompt($community, $content);

        try {
            $response = $this->aiService->generateWithAnthropic($prompt, [
                'model' => 'claude-3-opus-20240229',
                'max_tokens' => 2000,
            ]);

            return $this->parseDigestResponse($response, $content);
        } catch (\Exception $e) {
            Log::error('AI digest generation failed', [
                'community_id' => $community->id,
                'error' => $e->getMessage(),
            ]);

            // Fallback to basic content
            return [
                'subject' => "Daily Digest - {$community->name} - " . now()->format('M j, Y'),
                'preview' => 'Your daily roundup of local news and events.',
                'intro' => "Here's what's happening in {$community->name} today.",
                'stories' => array_map(fn($story) => [
                    'title' => $story->title ?? 'Untitled',
                    'summary' => substr($story->excerpt ?? $story->content ?? '', 0, 150),
                ], $content['top_stories'] ?? []),
            ];
        }
    }

    /**
     * Generate newsletter content using AI
     */
    public function generateNewsletterContent(Community $community, array $content): array
    {
        $prompt = $this->buildNewsletterPrompt($community, $content);

        try {
            $response = $this->aiService->generateWithAnthropic($prompt, [
                'model' => 'claude-3-opus-20240229',
                'max_tokens' => 3000,
            ]);

            return $this->parseNewsletterResponse($response, $content);
        } catch (\Exception $e) {
            Log::error('AI newsletter generation failed', [
                'community_id' => $community->id,
                'error' => $e->getMessage(),
            ]);

            // Fallback
            return [
                'subject' => "Weekly Newsletter - {$community->name}",
                'preview' => 'Your weekly roundup of local news and events.',
                'editorial' => "Here's what happened in {$community->name} this week.",
            ];
        }
    }

    /**
     * Generate subject lines (for A/B testing)
     */
    public function generateSubjectLines(string $baseSubject, int $count = 3): array
    {
        $prompt = "Generate {$count} variations of this email subject line, each with a different angle or tone: {$baseSubject}";

        try {
            $response = $this->aiService->generateWithAnthropic($prompt, [
                'model' => 'claude-3-opus-20240229',
                'max_tokens' => 200,
            ]);

            // Parse response (assuming line-separated or JSON)
            $lines = array_filter(array_map('trim', explode("\n", $response)));
            return array_slice($lines, 0, $count);
        } catch (\Exception $e) {
            Log::error('AI subject line generation failed', ['error' => $e->getMessage()]);
            return [$baseSubject];
        }
    }

    /**
     * Build digest prompt
     */
    protected function buildDigestPrompt(Community $community, array $content): string
    {
        $stories = array_map(fn($s) => [
            'title' => $s->title ?? 'Untitled',
            'excerpt' => $s->excerpt ?? substr($s->content ?? '', 0, 200),
        ], $content['top_stories'] ?? []);

        return "Write a daily digest email for {$community->name}. Include:
- A compelling subject line (max 60 chars)
- Preview text (max 150 chars)
- Brief intro paragraph
- Summaries of top stories: " . json_encode($stories) . "
- Upcoming events: " . json_encode($content['upcoming_events'] ?? []) . "

Return JSON with: subject, preview, intro, stories (array with title and summary).";
    }

    /**
     * Parse digest response
     */
    protected function parseDigestResponse(string $response, array $content): array
    {
        // Try to parse as JSON first
        $decoded = json_decode($response, true);
        if ($decoded && isset($decoded['subject'])) {
            return $decoded;
        }

        // Fallback parsing
        return [
            'subject' => "Daily Digest - " . now()->format('M j, Y'),
            'preview' => substr($response, 0, 150),
            'intro' => substr($response, 0, 300),
            'stories' => array_map(fn($s) => [
                'title' => $s->title ?? 'Untitled',
                'summary' => substr($s->excerpt ?? '', 0, 150),
            ], $content['top_stories'] ?? []),
        ];
    }

    /**
     * Build newsletter prompt
     */
    protected function buildNewsletterPrompt(Community $community, array $content): string
    {
        return "Write a weekly newsletter email for {$community->name}. Include:
- A compelling subject line
- Preview text
- Editorial introduction
- Summary of week's top stories
- Upcoming events

Return JSON with: subject, preview, editorial, stories.";
    }

    /**
     * Parse newsletter response
     */
    protected function parseNewsletterResponse(string $response, array $content): array
    {
        $decoded = json_decode($response, true);
        if ($decoded && isset($decoded['subject'])) {
            return $decoded;
        }

        return [
            'subject' => "Weekly Newsletter - {$community->name}",
            'preview' => substr($response, 0, 150),
            'editorial' => substr($response, 0, 500),
        ];
    }
}


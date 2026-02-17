<?php

declare(strict_types=1);

namespace App\Services\Creator;

use App\Models\ContentModerationLog;
use App\Services\News\PrismAiService;
use Exception;
use Illuminate\Support\Facades\Log;

final class ContentModeratorService
{
    public function __construct(
        private readonly PrismAiService $ai,
    ) {}

    /**
     * Submit content for moderation. Returns moderation result.
     * This is the HOOK that all content creation calls.
     */
    public function moderate(
        string $contentType,
        string $contentId,
        string $content,
        array $metadata = [],
        string $trigger = 'on_create'
    ): ContentModerationLog {
        $log = ContentModerationLog::create([
            'content_type' => $contentType,
            'content_id' => $contentId,
            'region_id' => $metadata['region_id'] ?? null,
            'user_id' => $metadata['user_id'] ?? null,
            'trigger' => $trigger,
            'content_snapshot' => $content,
            'metadata' => $metadata,
            'status' => 'pending',
            'moderator_type' => 'ai',
        ]);

        try {
            $result = $this->runSimpleModeration($content, $contentType, $metadata);

            $log->update([
                'status' => $result['status'],
                'confidence_score' => $result['confidence'],
                'flags' => $result['flags'],
                'suggestions' => $result['suggestions'],
                'ai_model' => $result['model'] ?? 'google/gemini-2.0-flash-001',
            ]);
        } catch (Exception $e) {
            Log::error('ContentModeratorService: Moderation failed', [
                'content_type' => $contentType,
                'content_id' => $contentId,
                'error' => $e->getMessage(),
            ]);

            $log->update([
                'status' => 'needs_review',
                'moderator_notes' => 'AI moderation failed: '.$e->getMessage(),
            ]);
        }

        return $log;
    }

    /**
     * Receive moderator feedback (called by the moderation result receiver).
     */
    public function receiveFeedback(string $moderationLogId, array $feedback): ContentModerationLog
    {
        $log = ContentModerationLog::findOrFail($moderationLogId);

        $log->update([
            'status' => $feedback['status'] ?? $log->status,
            'confidence_score' => $feedback['confidence'] ?? $log->confidence_score,
            'flags' => $feedback['flags'] ?? $log->flags,
            'suggestions' => $feedback['suggestions'] ?? $log->suggestions,
            'moderator_notes' => $feedback['notes'] ?? $log->moderator_notes,
            'resolution' => $feedback['resolution'] ?? null,
            'resolved_by' => $feedback['resolved_by'] ?? null,
            'resolved_at' => isset($feedback['resolution']) ? now() : null,
        ]);

        return $log->fresh();
    }

    /**
     * Get moderation status for a piece of content.
     */
    public function getStatus(string $contentType, string $contentId): ?ContentModerationLog
    {
        return ContentModerationLog::forContent($contentType, $contentId)
            ->orderByDesc('created_at')
            ->first();
    }

    /**
     * Simple AI moderator — placeholder that will be replaced.
     */
    private function runSimpleModeration(string $content, string $contentType, array $metadata): array
    {
        $title = $metadata['title'] ?? '';

        $prompt = <<<PROMPT
        You are a content moderator for Day.News, a community news platform.
        Review this {$contentType} for policy violations.

        Title: {$title}
        Content: {$content}

        Check for:
        1. Spam or promotional manipulation
        2. Hate speech, discrimination, or harassment
        3. Misinformation or unverified dangerous claims
        4. Inappropriate or explicit content
        5. Personal identifiable information (PII) that shouldn't be public
        6. Copyright violations (large copied text blocks)
        7. Profanity or offensive language

        Return ONLY valid JSON:
        {
            "approved": true|false,
            "confidence": 0.0-1.0,
            "flags": [{"type": "spam|hate|misinformation|inappropriate|pii|copyright|profanity", "severity": "low|medium|high", "detail": "string"}],
            "suggestions": [{"type": "rewrite|remove|add_disclaimer", "target": "string", "suggestion": "string"}],
            "summary": "string"
        }
        PROMPT;

        $result = $this->ai->chat($prompt, 'google/gemini-2.0-flash-001');
        $parsed = json_decode(preg_replace('/```(?:json)?\s*/i', '', mb_trim($result)), true);

        if (! $parsed) {
            return [
                'status' => 'needs_review',
                'confidence' => 0.5,
                'flags' => [],
                'suggestions' => [],
                'model' => 'google/gemini-2.0-flash-001',
            ];
        }

        $hasHighSeverity = collect($parsed['flags'] ?? [])->contains(fn ($f) => ($f['severity'] ?? '') === 'high');

        return [
            'status' => ($parsed['approved'] ?? true) ? 'approved' : ($hasHighSeverity ? 'rejected' : 'flagged'),
            'confidence' => $parsed['confidence'] ?? 0.8,
            'flags' => $parsed['flags'] ?? [],
            'suggestions' => $parsed['suggestions'] ?? [],
            'model' => 'google/gemini-2.0-flash-001',
        ];
    }
}

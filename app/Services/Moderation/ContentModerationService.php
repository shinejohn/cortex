<?php

declare(strict_types=1);

namespace App\Services\Moderation;

use App\Models\ContentModerationLog;
use App\Services\News\PrismAiService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use RuntimeException;
use Throwable;

final class ContentModerationService
{
    private const FAIL_OPEN = true;

    public function __construct(
        private readonly PrismAiService $prismAiService,
        private readonly ModerationNotificationService $notificationService,
    ) {}

    /**
     * Moderate a piece of content. Returns true if content PASSES.
     * Returns false if content FAILS (rejected).
     */
    public function moderate(
        Model $content,
        string $contentType,
        string $trigger,
        ?string $userId = null,
        ?string $regionId = null,
    ): bool {
        if (! config('content-moderation.enabled', true)) {
            return true;
        }

        $startTime = microtime(true);
        $contentId = (string) ($content->id ?? 'pre-create');

        $snapshot = $this->buildContentSnapshot($content, $contentType);
        $metadata = $this->buildMetadata($content, $contentType);

        try {
            $result = $this->callAiModerator($snapshot, $contentType, $metadata);
            $processingMs = (int) ((microtime(true) - $startTime) * 1000);

            $log = ContentModerationLog::create([
                'content_type' => $contentType,
                'content_id' => $contentId,
                'region_id' => $regionId,
                'user_id' => $userId,
                'trigger' => $trigger,
                'content_snapshot' => $snapshot,
                'metadata' => $metadata,
                'decision' => $result['decision'],
                'violation_section' => $result['violation_section'] ?? null,
                'violation_explanation' => $result['violation_explanation'] ?? null,
                'ai_model' => $result['model'],
                'processing_ms' => $processingMs,
            ]);

            if ($result['decision'] === ContentModerationLog::DECISION_FAIL) {
                $this->handleRejection($content, $contentType, $log);

                return false;
            }

            return true;
        } catch (Throwable $e) {
            Log::error('Content moderation AI call failed', [
                'content_type' => $contentType,
                'content_id' => $contentId,
                'error' => $e->getMessage(),
            ]);

            ContentModerationLog::create([
                'content_type' => $contentType,
                'content_id' => $contentId,
                'region_id' => $regionId,
                'user_id' => $userId,
                'trigger' => $trigger,
                'content_snapshot' => $snapshot,
                'metadata' => $metadata,
                'decision' => ContentModerationLog::DECISION_PASS,
                'violation_explanation' => 'AI_FAILURE: '.$e->getMessage(),
                'ai_model' => 'error',
                'processing_ms' => (int) ((microtime(true) - $startTime) * 1000),
            ]);

            return self::FAIL_OPEN;
        }
    }

    private function buildContentSnapshot(Model $content, string $contentType): string
    {
        return match ($contentType) {
            'day_news_post' => implode("\n", array_filter([
                'Title: '.($content->title ?? $content->generated_title ?? ''),
                'Content: '.strip_tags($content->content ?? $content->generated_content ?? $content->body ?? ''),
                'Excerpt: '.($content->excerpt ?? $content->generated_excerpt ?? ''),
            ])),
            'comment', 'review' => (string) ($content->body ?? $content->content ?? ''),
            'event' => implode("\n", array_filter([
                'Title: '.($content->title ?? ''),
                'Description: '.strip_tags($content->description ?? ''),
                'Venue: '.($content->venue?->name ?? $content->venue_name ?? ''),
            ])),
            'business_listing' => implode("\n", array_filter([
                'Name: '.($content->name ?? ''),
                'Description: '.strip_tags($content->description ?? ''),
            ])),
            'ad_campaign' => implode("\n", array_filter([
                'Headline: '.($content->headline ?? ''),
                'Body: '.strip_tags($content->body ?? ''),
            ])),
            default => (string) ($content->content ?? $content->body ?? $content->description ?? ''),
        };
    }

    private function buildMetadata(Model $content, string $contentType): array
    {
        return [
            'title' => $content->title ?? $content->generated_title ?? null,
            'category' => $content->category ?? null,
        ];
    }

    private function callAiModerator(string $snapshot, string $contentType, array $metadata): array
    {
        $promptKey = $contentType === 'comment' ? 'comment' : 'standard';
        $template = config("content-moderation.prompts.{$promptKey}");
        $prompt = str_replace(
            ['{content_type}', '{content}'],
            [$contentType, $snapshot],
            $template
        );

        $model = config('content-moderation.ai_model', 'google/gemini-2.0-flash-lite-001');
        $raw = $this->prismAiService->chat($prompt, $model);
        $cleaned = preg_replace('/```(?:json)?\s*/i', '', mb_trim($raw));
        $parsed = json_decode($cleaned, true);

        if (! $parsed || ! isset($parsed['decision'])) {
            throw new RuntimeException('Invalid AI moderation response');
        }

        return [
            'decision' => mb_strtolower($parsed['decision']) === 'fail' ? 'fail' : 'pass',
            'violation_section' => $parsed['violation_section'] ?? null,
            'violation_explanation' => $parsed['violation_explanation'] ?? null,
            'model' => $model,
        ];
    }

    private function handleRejection(
        Model $content,
        string $contentType,
        ContentModerationLog $log
    ): void {
        if (method_exists($content, 'getTable')
            && Schema::hasColumn($content->getTable(), 'moderation_status')
        ) {
            $content->update([
                'moderation_status' => 'moderation_rejected',
            ]);
        }

        $this->notificationService->sendRejectionNotification($content, $contentType, $log);

        Log::info('Content moderation: REJECTED', [
            'content_type' => $contentType,
            'content_id' => $content->id,
            'violation' => $log->violation_section,
        ]);
    }
}

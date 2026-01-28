<?php

declare(strict_types=1);

namespace App\Services\Cies;

use App\Models\CommunityHistoryEntry;
use App\Models\Region;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

final class HistoryLoggingService
{
    /**
     * Log a significant event to the community history
     */
    public function logEvent(Region $region, string $contentType, Model $contentModel, array $data): CommunityHistoryEntry
    {
        // Extract basic data
        $eventDate = $data['event_date'] ?? now();
        $locationName = $data['location_name'] ?? null;

        // AI Summary generation would happen here or be passed in
        $summary = $data['ai_summary'] ?? $this->generateSummary($contentModel);

        $entry = CommunityHistoryEntry::forceCreate([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'region_id' => $region->id,
            'content_type' => $contentType,
            'content_id' => $contentModel->getKey(),
            'event_date' => $eventDate instanceof \DateTimeInterface ? $eventDate->format('Y-m-d') : $eventDate,
            'location_name' => $locationName,
            'topic_tags' => $data['topic_tags'] ?? [],
            'categories' => $data['categories'] ?? [],
            'ai_summary' => $summary,
            'key_facts' => $data['key_facts'] ?? [],
            'affected_entities' => $data['affected_entities'] ?? [],
        ]);

        Log::info('HistoryLogging: Created entry', ['id' => $entry->id, 'region' => $region->name]);

        return $entry;
    }

    /**
     * Find related history entries
     */
    public function findRelated(CommunityHistoryEntry $entry): \Illuminate\Database\Eloquent\Collection
    {
        // Simple tag matching for now
        return CommunityHistoryEntry::where('region_id', $entry->region_id)
            ->where('id', '!=', $entry->id)
            ->whereJsonContains('topic_tags', $entry->topic_tags[0] ?? '')
            ->limit(5)
            ->get();
    }

    private function generateSummary(Model $model): string
    {
        // Placeholder for AI summarization
        // In real impl, would call LlmService
        return "Auto-generated summary for " . class_basename($model);
    }
}

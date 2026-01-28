<?php

declare(strict_types=1);

namespace App\Newsroom\Intelligence;

use App\Models\CommunityLog;
use App\Models\StoryThread;
use Illuminate\Support\Facades\Log;

class CommunityHistorian
{
    /**
     * Archive a resolved story thread into the community history
     */
    public function logResolvedThread(StoryThread $thread): void
    {
        if ($thread->status !== 'resolved') {
            return;
        }

        CommunityLog::create([
            'region_id' => $thread->region_id,
            'story_thread_id' => $thread->id,
            'event_type' => 'story_resolution',
            'title' => $thread->title,
            'summary' => $thread->summary ?? 'No summary available',
            'occurred_at' => now(), // Or use specific resolution date
            'key_figures' => $thread->key_people, // Assuming JSON structure compatibility
            'impact_metrics' => [
                'total_views' => $thread->total_views,
                'total_comments' => $thread->total_comments,
            ]
        ]);

        Log::info("[Newsroom] Logged historical event: {$thread->title}");
    }
}

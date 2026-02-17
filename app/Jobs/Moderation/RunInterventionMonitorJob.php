<?php

declare(strict_types=1);

namespace App\Jobs\Moderation;

use App\Models\ContentComplaint;
use App\Models\ContentInterventionLog;
use App\Models\DayNewsPost;
use App\Services\Moderation\InterventionMonitorService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class RunInterventionMonitorJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
        $this->onQueue('moderation');
    }

    public function handle(InterventionMonitorService $monitor): void
    {
        $activePosts = DayNewsPost::where('moderation_status', 'published')
            ->orWhereNull('moderation_status')
            ->where('created_at', '>=', now()->subHours(24))
            ->withCount('comments')
            ->having('comments_count', '>', 0)
            ->get();

        $config = config('content-moderation.intervention');

        foreach ($activePosts as $post) {
            $commentCount = $post->comments()->count();
            $failedComments = $post->comments()
                ->where('moderation_status', 'moderation_rejected')
                ->count();
            $complaints = ContentComplaint::where('content_type', 'day_news_post')
                ->where('content_id', (string) $post->id)
                ->distinct('complainant_id')
                ->count('complainant_id');

            $triggered = false;
            $signal = null;

            if ($commentCount > 0 && $complaints >= $config['complaint_threshold']) {
                $triggered = true;
                $signal = ContentInterventionLog::SIGNAL_COMPLAINTS;
            }

            if ($commentCount > 0 && ($failedComments / $commentCount) > $config['failure_rate_threshold']) {
                $triggered = true;
                $signal = $signal ?? ContentInterventionLog::SIGNAL_FAILURE_RATE;
            }

            if (! $triggered) {
                continue;
            }

            $recentIntervention = ContentInterventionLog::where('content_type', 'day_news_post')
                ->where('content_id', (string) $post->id)
                ->where('created_at', '>=', now()->subHours(6))
                ->exists();

            if ($recentIntervention) {
                continue;
            }

            $monitor->runIntervention(
                $post,
                'day_news_post',
                $signal ?? ContentInterventionLog::SIGNAL_COMPLAINTS,
                $commentCount,
                $failedComments,
                $complaints
            );
        }
    }
}

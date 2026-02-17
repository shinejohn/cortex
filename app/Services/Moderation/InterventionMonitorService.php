<?php

declare(strict_types=1);

namespace App\Services\Moderation;

use App\Models\ContentInterventionLog;
use Illuminate\Database\Eloquent\Model;

final class InterventionMonitorService
{
    public function __construct(
        private readonly ModerationNotificationService $notificationService,
    ) {}

    public function scan(): void
    {
        // Scheduled job will call this - implementation in RunInterventionMonitorJob
    }

    public function evaluateContent(Model $content, string $contentType): void
    {
        $config = config('content-moderation.intervention');
        // Implementation in RunInterventionMonitorJob
    }

    public function runIntervention(
        Model $content,
        string $contentType,
        string $signal,
        int $commentCount,
        int $failedComments,
        int $complaints
    ): ContentInterventionLog {
        $compliantComments = $commentCount - $failedComments;
        $ratio = $commentCount > 0 ? $compliantComments / $commentCount : 1.0;
        $config = config('content-moderation.intervention');

        if ($ratio >= $config['civil_discourse_protected']) {
            $outcome = ContentInterventionLog::OUTCOME_PROTECTED;
            $reason = 'Civil discourse ratio is healthy at '.round($ratio * 100).'%';
        } elseif ($ratio >= $config['civil_discourse_monitoring']) {
            $outcome = ContentInterventionLog::OUTCOME_ENHANCED_MONITORING;
            $reason = 'Mixed engagement at '.round($ratio * 100).'%. Enhanced monitoring active.';
        } else {
            $outcome = ContentInterventionLog::OUTCOME_REMOVED;
            $reason = 'Civil discourse ratio at '.round($ratio * 100).'% is below 50% threshold.';
            $content->update([
                'moderation_status' => 'moderation_removed',
                'moderation_removal_reason' => $reason,
            ]);
            $this->notificationService->sendRemovalNotification($content, $contentType, $ratio);
        }

        return ContentInterventionLog::create([
            'content_type' => $contentType,
            'content_id' => (string) $content->id,
            'trigger_signal' => $signal,
            'total_comments' => $commentCount,
            'compliant_comments' => $compliantComments,
            'non_compliant_comments' => $failedComments,
            'civil_discourse_ratio' => $ratio,
            'unique_complaints' => $complaints,
            'outcome' => $outcome,
            'outcome_reason' => $reason,
        ]);
    }
}

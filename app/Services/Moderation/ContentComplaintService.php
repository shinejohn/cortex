<?php

declare(strict_types=1);

namespace App\Services\Moderation;

use App\Models\ContentComplaint;
use App\Models\ContentModerationLog;

final class ContentComplaintService
{
    public function fileComplaint(
        string $contentType,
        string $contentId,
        string $userId,
        string $reason,
        ?string $freeText = null,
    ): ContentComplaint {
        $existing = ContentComplaint::where('content_type', $contentType)
            ->where('content_id', $contentId)
            ->where('complainant_id', $userId)
            ->first();

        if ($existing) {
            throw new \App\Exceptions\DuplicateComplaintException;
        }

        return ContentComplaint::create([
            'content_type' => $contentType,
            'content_id' => $contentId,
            'complainant_id' => $userId,
            'complaint_reason' => $reason,
            'complaint_text' => $freeText,
            'complaint_type' => ContentComplaint::TYPE_USER,
        ]);
    }

    public function fileAppeal(
        string $moderationLogId,
        string $creatorId,
        string $appealText,
    ): ContentComplaint {
        $log = ContentModerationLog::findOrFail($moderationLogId);

        if ($log->user_id !== $creatorId) {
            throw new \Illuminate\Auth\Access\AuthorizationException;
        }

        if ($log->appeal_status !== null) {
            throw new \App\Exceptions\DuplicateAppealException;
        }

        $log->update(['appeal_status' => ContentModerationLog::APPEAL_PENDING]);

        return ContentComplaint::create([
            'content_type' => $log->content_type,
            'content_id' => $log->content_id,
            'complainant_id' => $creatorId,
            'complaint_reason' => 'creator_appeal',
            'complaint_text' => $appealText,
            'complaint_type' => ContentComplaint::TYPE_CREATOR_APPEAL,
        ]);
    }
}

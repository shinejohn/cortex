<?php

declare(strict_types=1);

namespace App\Services\Moderation;

use App\Mail\ContentRejectionNotification;
use App\Mail\ContentRemovalNotification;
use App\Models\ContentModerationLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;

final class ModerationNotificationService
{
    public function sendRejectionNotification(
        Model $content,
        string $contentType,
        ContentModerationLog $log
    ): void {
        $user = $log->user_id ? \App\Models\User::find($log->user_id) : null;
        if (! $user?->email) {
            return;
        }

        $mailable = new ContentRejectionNotification($content, $contentType, $log);
        Mail::to($user->email)->send($mailable);
    }

    public function sendRemovalNotification(
        Model $content,
        string $contentType,
        float $civilDiscourseRatio
    ): void {
        $userId = $content->author_id ?? $content->created_by ?? $content->user_id ?? null;
        $user = $userId ? \App\Models\User::find($userId) : null;
        if (! $user?->email) {
            return;
        }

        $mailable = new ContentRemovalNotification($content, $contentType, $civilDiscourseRatio);
        Mail::to($user->email)->send($mailable);
    }

    public function sendComplaintResponsePass(Model $content, string $contentType, string $complainantEmail, string $reason, string $explanation): void
    {
        // TODO: Implement ComplaintResponsePass mailable
    }

    public function sendComplaintResponseFail(Model $content, string $contentType, string $complainantEmail, string $reason, string $violationSection): void
    {
        // TODO: Implement ComplaintResponseFail mailable
    }

    public function sendAppealOverturned(Model $content, string $contentType, string $creatorEmail, ContentModerationLog $log): void
    {
        // TODO: Implement AppealOverturned mailable
    }

    public function sendAppealUpheld(Model $content, string $contentType, string $creatorEmail, ContentModerationLog $log): void
    {
        // TODO: Implement AppealUpheld mailable
    }
}

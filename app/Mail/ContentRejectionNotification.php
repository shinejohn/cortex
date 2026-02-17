<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\ContentModerationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class ContentRejectionNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly mixed $content,
        public readonly string $contentType,
        public readonly ContentModerationLog $log
    ) {
        $this->log->load('user');
    }

    public function envelope(): Envelope
    {
        $typeLabel = $this->contentTypeLabel();

        return new Envelope(
            subject: "Your {$typeLabel} Was Not Published — Day.News Content Standards",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.moderation.rejection',
            with: [
                'contentTitle' => mb_substr($this->content->title ?? $this->content->generated_title ?? '', 0, 100),
                'creatorName' => $this->log->user?->name ?? 'Creator',
                'submittedAt' => $this->log->created_at?->format('M j, Y g:i A') ?? now()->format('M j, Y g:i A'),
                'contentTypeLabel' => $this->contentTypeLabel(),
                'policyUrl' => config('app.url'),
                'appealUrl' => config('app.url'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }

    private function contentTypeLabel(): string
    {
        return match ($this->contentType) {
            'day_news_post' => 'Article',
            'event' => 'Event',
            'comment' => 'Comment',
            'business_listing' => 'Business Listing',
            'ad_campaign' => 'Advertisement',
            default => 'Content',
        };
    }
}

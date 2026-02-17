<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class ContentRemovalNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly mixed $content,
        public readonly string $contentType,
        public readonly float $civilDiscourseRatio
    ) {}

    public function envelope(): Envelope
    {
        $typeLabel = $this->contentTypeLabel();

        return new Envelope(
            subject: "Your {$typeLabel} Has Been Removed from View — Day.News",
        );
    }

    public function content(): Content
    {
        $title = $this->content->title ?? $this->content->generated_title ?? '';
        $publishedAt = $this->content->published_at?->format('M j, Y g:i A')
            ?? $this->content->created_at?->format('M j, Y g:i A')
            ?? 'N/A';

        return new Content(
            view: 'emails.moderation.removal',
            with: [
                'contentTitle' => mb_substr((string) $title, 0, 100),
                'contentTypeLabel' => $this->contentTypeLabel(),
                'publishedAt' => $publishedAt,
                'civilDiscourseRatio' => $this->civilDiscourseRatio,
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
            default => 'Content',
        };
    }
}

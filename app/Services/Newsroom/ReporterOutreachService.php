<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\Business;
use App\Models\BusinessMention;
use App\Models\DayNewsPost;
use App\Models\NewsArticleDraft;
use App\Models\ReporterOutreachRequest;
use App\Services\News\PrismAiService;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

final class ReporterOutreachService
{
    public function __construct(
        private readonly PrismAiService $ai,
    ) {}

    /**
     * Send reporter outreach for a published business article.
     * Identifies featured businesses, generates personalized emails, sends and tracks.
     */
    public function sendOutreach(DayNewsPost $post): array
    {
        if ($post->category !== 'business') {
            return ['sent' => 0, 'skipped' => 0, 'errors' => 0];
        }

        $contacts = $this->collectContacts($post);
        if (empty($contacts)) {
            Log::debug('ReporterOutreach: No contacts for post', ['post_id' => $post->id]);

            return ['sent' => 0, 'skipped' => 0, 'errors' => 0];
        }

        $regionId = $post->regions()->first()?->id;
        if (! $regionId) {
            return ['sent' => 0, 'skipped' => 0, 'errors' => 0];
        }

        $sent = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($contacts as $contact) {
            $email = $contact['email'];
            if (empty($email) || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skipped++;

                continue;
            }

            $existing = ReporterOutreachRequest::where('day_news_post_id', $post->id)
                ->where('contact_email', $email)
                ->exists();
            if ($existing) {
                $skipped++;

                continue;
            }

            try {
                $emailContent = $this->generateOutreachEmail($post, $contact);
                $request = ReporterOutreachRequest::create([
                    'region_id' => $regionId,
                    'day_news_post_id' => $post->id,
                    'business_id' => $contact['business_id'] ?? null,
                    'contact_email' => $email,
                    'email_subject' => $emailContent['subject'],
                    'email_body' => $emailContent['body'],
                    'status' => ReporterOutreachRequest::STATUS_PENDING,
                ]);

                Mail::raw($emailContent['body'], function ($message) use ($email, $emailContent) {
                    $message->to($email)
                        ->subject($emailContent['subject'])
                        ->from(config('mail.from.address'), config('mail.from.name'));
                });

                $request->update([
                    'status' => ReporterOutreachRequest::STATUS_SENT,
                    'sent_at' => now(),
                ]);
                $sent++;
            } catch (Exception $e) {
                $errors++;
                Log::error('ReporterOutreach: Send failed', [
                    'post_id' => $post->id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return ['sent' => $sent, 'skipped' => $skipped, 'errors' => $errors];
    }

    /**
     * Collect business contacts from a published article.
     *
     * @return array<int, array{email: string, business_id: ?string, business_name: string}>
     */
    private function collectContacts(DayNewsPost $post): array
    {
        $contacts = [];
        $seenEmails = [];

        $draftId = $post->metadata['source_draft_id'] ?? null;
        if (! $draftId) {
            return [];
        }

        $draft = NewsArticleDraft::with('newsArticle.rawContent')->find($draftId);
        if (! $draft?->newsArticle) {
            return [];
        }

        $article = $draft->newsArticle;
        $rawContent = $article->rawContent;

        if ($article->business_id) {
            $business = Business::find($article->business_id);
            if ($business && $business->email && ! isset($seenEmails[$business->email])) {
                $contacts[] = [
                    'email' => $business->email,
                    'business_id' => $business->id,
                    'business_name' => $business->name,
                ];
                $seenEmails[$business->email] = true;
            }
        }

        if ($rawContent) {
            $mentions = BusinessMention::where('raw_content_id', $rawContent->id)
                ->with('business')
                ->get();

            foreach ($mentions as $mention) {
                $business = $mention->business;
                $email = $business?->email ?? null;
                if ($email && ! isset($seenEmails[$email])) {
                    $contacts[] = [
                        'email' => $email,
                        'business_id' => $business?->id,
                        'business_name' => $business?->name ?? $mention->business_name,
                    ];
                    $seenEmails[$email] = true;
                }
            }
        }

        return $contacts;
    }

    /**
     * Generate personalized outreach email via AI.
     *
     * @param  array{email: string, business_id: ?string, business_name: string}  $contact
     * @return array{subject: string, body: string}
     */
    private function generateOutreachEmail(DayNewsPost $post, array $contact): array
    {
        $prompt = <<<PROMPT
You are a local news editor reaching out to a business that was featured in an article we just published.

Article title: {$post->title}
Business name: {$contact['business_name']}
Article excerpt: {$post->excerpt}

Write a SHORT, friendly email (3-5 sentences max) that:
1. Informs them their business was featured
2. Invites them to share the article with customers
3. Offers to add a link or update if they have corrections
4. Signs off professionally

Respond with JSON only:
{"subject": "Compelling subject line under 60 chars", "body": "Plain text email body"}
PROMPT;

        $result = $this->ai->generateJson($prompt, [
            'type' => 'object',
            'properties' => [
                'subject' => ['type' => 'string'],
                'body' => ['type' => 'string'],
            ],
            'required' => ['subject', 'body'],
        ]);

        return [
            'subject' => $result['subject'] ?? 'Your business was featured on Day.News',
            'body' => $result['body'] ?? "Hi,\n\nWe recently published an article featuring {$contact['business_name']}. We thought you might like to share it with your customers.\n\nBest,\nThe Day.News Team",
        ];
    }
}

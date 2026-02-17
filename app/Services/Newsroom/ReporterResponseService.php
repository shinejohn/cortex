<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\ReporterOutreachRequest;
use App\Models\ReporterResponse;
use App\Models\SalesOpportunity;
use App\Services\News\PrismAiService;
use Exception;
use Illuminate\Support\Facades\Log;

final class ReporterResponseService
{
    public function __construct(
        private readonly PrismAiService $ai,
    ) {}

    /**
     * Process an incoming email reply to reporter outreach.
     * Extracts quotes, updates post if usable, creates SalesOpportunity for responsive businesses.
     */
    public function processIncomingReply(
        ReporterOutreachRequest $outreach,
        string $rawEmailContent
    ): ReporterResponse {
        $extraction = $this->extractQuotesAndSentiment($rawEmailContent, $outreach);

        $response = ReporterResponse::create([
            'outreach_request_id' => $outreach->id,
            'raw_email_content' => $rawEmailContent,
            'extracted_quotes' => $extraction['quotes'],
            'sentiment' => $extraction['sentiment'],
            'usable' => $extraction['usable'],
            'processed_at' => now(),
        ]);

        $outreach->update([
            'status' => ReporterOutreachRequest::STATUS_RESPONDED,
            'response_received_at' => now(),
        ]);

        if ($extraction['usable'] && ! empty($extraction['quotes'])) {
            $this->updatePostWithQuotes($outreach, $extraction['quotes']);
            $this->createOrUpdateSalesOpportunity($outreach);
        }

        return $response;
    }

    /**
     * @return array{quotes: array, sentiment: string, usable: bool}
     */
    private function extractQuotesAndSentiment(string $rawContent, ReporterOutreachRequest $outreach): array
    {
        $businessName = $outreach->business?->name ?? 'Unknown';
        $articleTitle = $outreach->dayNewsPost?->title ?? 'Unknown';

        $prompt = <<<PROMPT
This is an email reply from a business owner who was contacted about a news article featuring their business.

Article: {$articleTitle}
Business: {$businessName}

Email content:
{$rawContent}

Extract any usable quotes (statements that could be added to the article as a real quote from the business).
Determine sentiment: positive, neutral, or negative.
Determine if the response contains usable content for the article (willing to be quoted, has new information, etc).

Respond with JSON only:
{"quotes": ["quote1", "quote2"], "sentiment": "positive|neutral|negative", "usable": true|false}
PROMPT;

        try {
            $result = $this->ai->generateJson($prompt, [
                'type' => 'object',
                'properties' => [
                    'quotes' => [
                        'type' => 'array',
                        'items' => ['type' => 'string'],
                    ],
                    'sentiment' => ['type' => 'string'],
                    'usable' => ['type' => 'boolean'],
                ],
                'required' => ['quotes', 'sentiment', 'usable'],
            ]);

            return [
                'quotes' => $result['quotes'] ?? [],
                'sentiment' => $result['sentiment'] ?? 'neutral',
                'usable' => (bool) ($result['usable'] ?? false),
            ];
        } catch (Exception $e) {
            Log::error('ReporterResponse: Quote extraction failed', [
                'outreach_id' => $outreach->id,
                'error' => $e->getMessage(),
            ]);

            return ['quotes' => [], 'sentiment' => 'neutral', 'usable' => false];
        }
    }

    private function updatePostWithQuotes(ReporterOutreachRequest $outreach, array $quotes): void
    {
        $post = $outreach->dayNewsPost;
        if (! $post) {
            return;
        }

        $bestQuote = $quotes[0] ?? null;
        if (! $bestQuote) {
            return;
        }

        $content = $post->content;
        $attribution = $outreach->business?->name ?? 'A local business owner';

        $blockquote = "<blockquote cite=\"{$attribution}\">\"{$bestQuote}\" — {$attribution}</blockquote>";
        $closingTag = '</p>';
        $pos = mb_strrpos($content, $closingTag);
        if ($pos !== false) {
            $content = substr_replace($content, $closingTag.$blockquote, $pos, mb_strlen($closingTag));
        } else {
            $content .= $blockquote;
        }

        $post->update(['content' => $content]);
        Log::info('ReporterResponse: Updated post with quote', ['post_id' => $post->id]);
    }

    private function createOrUpdateSalesOpportunity(ReporterOutreachRequest $outreach): void
    {
        $business = $outreach->business;
        if (! $business) {
            return;
        }

        if ($business->is_advertiser ?? false || $business->is_command_center_customer ?? false) {
            return;
        }

        $existing = SalesOpportunity::where('business_id', $business->id)
            ->where('region_id', $outreach->region_id)
            ->whereIn('status', ['new', 'assigned', 'contacted'])
            ->first();

        if ($existing) {
            if (method_exists($existing, 'logActivity')) {
                $existing->logActivity('reporter_response', [
                    'outreach_id' => $outreach->id,
                    'post_id' => $outreach->day_news_post_id,
                ]);
            }

            return;
        }

        SalesOpportunity::create([
            'region_id' => $outreach->region_id,
            'business_id' => $business->id,
            'business_name' => $business->name,
            'business_contact_email' => $business->email,
            'business_contact_phone' => $business->phone,
            'source_type' => 'reporter_outreach',
            'source_id' => $outreach->id,
            'opportunity_type' => 'reporter_response',
            'priority_score' => 9,
            'trigger_description' => "Responded to reporter outreach for: {$outreach->dayNewsPost?->title}",
            'recommended_action' => 'Follow up - business engaged with coverage',
            'status' => 'new',
        ]);
    }
}

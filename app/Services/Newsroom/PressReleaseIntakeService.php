<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\PressRelease;
use App\Models\RawContent;
use Exception;
use Illuminate\Support\Facades\Log;

final class PressReleaseIntakeService
{
    public function __construct(
        private readonly GeographicScopeService $geoScope,
    ) {}

    /**
     * Process a press release submitted via web portal (SMB Command Center).
     */
    public function processWebSubmission(array $data): PressRelease
    {
        $pr = PressRelease::create([
            'company_name' => $data['company_name'],
            'contact_name' => $data['contact_name'],
            'contact_email' => $data['contact_email'],
            'contact_phone' => $data['contact_phone'] ?? null,
            'headline' => $data['headline'],
            'subheadline' => $data['subheadline'] ?? null,
            'body' => $data['body'],
            'dateline_city' => $data['city'] ?? null,
            'dateline_state' => $data['state'] ?? null,
            'release_date' => isset($data['release_date']) ? \Carbon\Carbon::parse($data['release_date']) : now(),
            'embargo_until' => isset($data['embargo_until']) ? \Carbon\Carbon::parse($data['embargo_until']) : null,
            'source_wire_service' => 'direct_submission',
            'status' => 'received',
            'attachments' => $data['attachments'] ?? null,
        ]);

        $contentHash = hash('sha256', $pr->headline."\n".$pr->body);
        [$communityId, $regionId] = $this->resolveCommunityAndRegion(
            $pr->dateline_city,
            $pr->dateline_state
        );

        $raw = RawContent::create([
            'source_title' => $pr->headline,
            'source_content' => $pr->body,
            'source_published_at' => $pr->release_date,
            'content_hash' => $contentHash,
            'collection_method' => 'press_release',
            'press_release_id' => $pr->id,
            'dateline_city' => $pr->dateline_city,
            'dateline_state' => $pr->dateline_state,
            'community_id' => $communityId,
            'region_id' => $regionId,
            'raw_metadata' => [
                'press_release_id' => $pr->id,
                'company_name' => $pr->company_name,
                'contact_email' => $pr->contact_email,
                'channel' => 'web_portal',
            ],
            'classification_status' => 'pending',
            'routing_status' => 'pending',
            'processing_status' => 'pending',
        ]);

        $pr->update(['raw_content_id' => $raw->id]);

        Log::info('PressRelease: Web submission received', [
            'pr_id' => $pr->id,
            'headline' => $pr->headline,
        ]);

        return $pr;
    }

    /**
     * Poll IMAP email inboxes for press releases.
     * Uses CollectionMethod TYPE_EMAIL infrastructure.
     */
    public function pollEmailInboxes(): array
    {
        $stats = ['mailboxes_checked' => 0, 'emails_found' => 0, 'processed' => 0];

        $methods = \App\Models\CollectionMethod::where('method_type', 'email')
            ->where('is_enabled', true)
            ->get();

        foreach ($methods as $method) {
            try {
                if (class_exists(\Webklex\PHPIMAP\Client::class)) {
                    $config = $method->scrape_config ?? [];
                    $client = \Webklex\PHPIMAP\Client::make([
                        'host' => $config['host'] ?? parse_url($method->endpoint_url, PHP_URL_HOST),
                        'port' => $config['port'] ?? 993,
                        'encryption' => $config['encryption'] ?? 'ssl',
                        'validate_cert' => $config['validate_cert'] ?? true,
                        'username' => $config['username'] ?? '',
                        'password' => $config['password'] ?? '',
                    ]);

                    $client->connect();
                    $folder = $client->getFolder('INBOX');
                    $messages = $folder->messages()->unseen()->get();

                    foreach ($messages as $message) {
                        $from = $message->getFrom();
                        $fromAddress = $from->first();
                        $companyName = $fromAddress?->mail ?? 'Unknown';
                        $contactName = $fromAddress?->personal ?? '';
                        $contactEmail = $fromAddress?->mail ?? '';

                        $this->processWebSubmission([
                            'company_name' => $companyName,
                            'contact_name' => $contactName,
                            'contact_email' => $contactEmail,
                            'headline' => $message->getSubject() ?? 'No Subject',
                            'body' => $message->getTextBody() ?? strip_tags($message->getHTMLBody() ?? ''),
                        ]);
                        $message->setFlag('Seen');
                        $stats['processed']++;
                    }
                    $client->disconnect();
                }
                $stats['mailboxes_checked']++;
            } catch (Exception $e) {
                Log::error('PressRelease: Email poll failed', [
                    'method_id' => $method->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $stats;
    }

    private function resolveCommunityAndRegion(?string $city, ?string $state): array
    {
        $regionIds = $this->geoScope->resolveRegionsFromDateline($city, $state);

        if (empty($regionIds)) {
            $fallback = config('news-workflow.business_content.fallback_community_id');

            return [$fallback, null];
        }

        $newsSource = \App\Models\NewsSource::where('region_id', $regionIds[0])
            ->whereNotNull('community_id')
            ->first();

        $communityId = $newsSource?->community_id ?? config('news-workflow.business_content.fallback_community_id');

        return [$communityId, $regionIds[0]];
    }
}

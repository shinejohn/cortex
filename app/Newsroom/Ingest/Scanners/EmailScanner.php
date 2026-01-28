<?php

declare(strict_types=1);

namespace App\Newsroom\Ingest\Scanners;

use App\Models\IncomingEmail;
use Illuminate\Support\Collection;

class EmailScanner extends BaseScanner
{
    public function getScannerType(): string
    {
        return 'email';
    }

    public function validateConfiguration(): bool
    {
        return true; // Config depends on Mailgun/Postmark webhooks setup
    }

    /**
     * Scan for unprocessed emails
     * @param array $options ['limit' => 50]
     */
    public function scan(array $options = []): Collection
    {
        $limit = $options['limit'] ?? 50;

        try {
            $emails = IncomingEmail::whereNull('processed_at')
                ->orderBy('created_at', 'asc')
                ->limit($limit)
                ->get();

            if ($emails->isEmpty()) {
                return collect();
            }

            $items = $emails->map(function ($email) {
                return new \App\Newsroom\DTOs\Signal(
                    title: $email->subject ?? 'No Subject',
                    content: $email->text_body ?? $email->html_body,
                    url: null, // Emails internal
                    authorName: $email->from_name ?? $email->from_email ?? 'Unknown Sender',
                    sourceName: 'Email Ingest',
                    publishedAt: $email->created_at ?? now(),
                    type: \App\Newsroom\Enums\SignalType::EMAIL_CONTENT,
                    metadata: [
                        'from_email' => $email->from_email,
                        'headers' => $email->headers,
                    ],
                    originalId: (string) $email->id
                );
            });

            $this->logActivity("Scanned {$items->count()} new emails");
            return $items;

        } catch (\Exception $e) {
            $this->logError("Email scan failed: " . $e->getMessage());
            return collect();
        }
    }
}

<?php

declare(strict_types=1);

namespace App\Newsroom\Ingest\Contracts;

use Illuminate\Support\Collection;

/**
 * Interface definition for any data source ingested into the Newsroom
 */
interface IngestSource
{
    /**
     * Scan the source for new content
     * 
     * @param array $options Configuration options (depth, filter, etc)
     * @return Collection Collection of standardized content items
     */
    public function scan(array $options = []): Collection;

    /**
     * Validate that the source is reachable/configured
     */
    public function validateConfiguration(): bool;

    /**
     * Get the descriptive type of this source scanner (rss, email, web, social)
     */
    public function getScannerType(): string;
}

<?php

declare(strict_types=1);

namespace App\Jobs\Regions;

use App\Models\Region;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

final class ProcessRegionImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * US state abbreviations to full names
     */
    private const STATE_NAMES = [
        'AL' => 'Alabama', 'AK' => 'Alaska', 'AZ' => 'Arizona', 'AR' => 'Arkansas',
        'CA' => 'California', 'CO' => 'Colorado', 'CT' => 'Connecticut', 'DE' => 'Delaware',
        'FL' => 'Florida', 'GA' => 'Georgia', 'HI' => 'Hawaii', 'ID' => 'Idaho',
        'IL' => 'Illinois', 'IN' => 'Indiana', 'IA' => 'Iowa', 'KS' => 'Kansas',
        'KY' => 'Kentucky', 'LA' => 'Louisiana', 'ME' => 'Maine', 'MD' => 'Maryland',
        'MA' => 'Massachusetts', 'MI' => 'Michigan', 'MN' => 'Minnesota', 'MS' => 'Mississippi',
        'MO' => 'Missouri', 'MT' => 'Montana', 'NE' => 'Nebraska', 'NV' => 'Nevada',
        'NH' => 'New Hampshire', 'NJ' => 'New Jersey', 'NM' => 'New Mexico', 'NY' => 'New York',
        'NC' => 'North Carolina', 'ND' => 'North Dakota', 'OH' => 'Ohio', 'OK' => 'Oklahoma',
        'OR' => 'Oregon', 'PA' => 'Pennsylvania', 'RI' => 'Rhode Island', 'SC' => 'South Carolina',
        'SD' => 'South Dakota', 'TN' => 'Tennessee', 'TX' => 'Texas', 'UT' => 'Utah',
        'VT' => 'Vermont', 'VA' => 'Virginia', 'WA' => 'Washington', 'WV' => 'West Virginia',
        'WI' => 'Wisconsin', 'WY' => 'Wyoming', 'DC' => 'District of Columbia',
    ];

    public int $timeout = 1800; // 30 minutes

    public int $tries = 1;

    /**
     * @param  array<int, array<string, mixed>>  $rows  Parsed CSV rows
     * @param  array<string, mixed>  $options  Import options
     */
    public function __construct(
        public array $rows,
        public array $options,
        public ?string $userId = null
    ) {}

    public function handle(): void
    {
        Log::info('ProcessRegionImportJob: Starting import', [
            'row_count' => count($this->rows),
            'options' => $this->options,
        ]);

        $stats = [
            'states_created' => 0,
            'counties_created' => 0,
            'cities_created' => 0,
            'neighborhoods_created' => 0,
            'skipped' => 0,
            'geocode_jobs_dispatched' => 0,
        ];

        $enableGeocoding = $this->options['enable_geocoding'] ?? true;
        $markActive = $this->options['mark_active'] ?? true;
        $storeMetadata = $this->options['store_metadata'] ?? true;
        $parentRegionId = $this->options['parent_region_id'] ?? null;

        // Cache for created regions to avoid duplicate lookups
        $stateCache = [];
        $countyCache = [];
        $cityCache = [];

        foreach ($this->rows as $row) {
            try {
                $stateAbbr = mb_trim($row['State'] ?? '');
                $countyName = mb_trim($row['County'] ?? '');
                $cityName = mb_trim($row['City'] ?? '');
                $communityName = mb_trim($row['Community'] ?? '');

                if (empty($stateAbbr) || empty($countyName) || empty($cityName)) {
                    $stats['skipped']++;

                    continue;
                }

                // Get or create State
                $stateName = self::STATE_NAMES[$stateAbbr] ?? $stateAbbr;
                $stateKey = Str::slug($stateName);

                if (! isset($stateCache[$stateKey])) {
                    $stateCreated = false;
                    $state = $this->findOrCreateRegion(
                        name: $stateName,
                        type: 'state',
                        parentId: $parentRegionId,
                        isActive: $markActive,
                        created: $stateCreated
                    );
                    $stateCache[$stateKey] = $state;
                    if ($stateCreated) {
                        $stats['states_created']++;
                    }
                }
                $state = $stateCache[$stateKey];

                // Get or create County
                $countyFullName = "{$countyName} County";
                $countyKey = $stateKey.'-'.Str::slug($countyName);

                if (! isset($countyCache[$countyKey])) {
                    $countyCreated = false;
                    $county = $this->findOrCreateRegion(
                        name: $countyFullName,
                        type: 'county',
                        parentId: $state->id,
                        isActive: $markActive,
                        created: $countyCreated,
                        slugSuffix: $stateAbbr
                    );
                    $countyCache[$countyKey] = $county;
                    if ($countyCreated) {
                        $stats['counties_created']++;
                    }
                }
                $county = $countyCache[$countyKey];

                // Get or create City
                $cityKey = $countyKey.'-'.Str::slug($cityName);

                if (! isset($cityCache[$cityKey])) {
                    $cityCreated = false;
                    $metadata = $storeMetadata ? $this->buildMetadata($row) : null;
                    $city = $this->findOrCreateRegion(
                        name: $cityName,
                        type: 'city',
                        parentId: $county->id,
                        isActive: $markActive,
                        created: $cityCreated,
                        slugSuffix: "{$countyName}-{$stateAbbr}",
                        metadata: $metadata
                    );
                    $cityCache[$cityKey] = $city;
                    if ($cityCreated) {
                        $stats['cities_created']++;

                        // Dispatch geocoding job for newly created cities
                        if ($enableGeocoding) {
                            GeocodeRegionJob::dispatch($city)->delay(now()->addSeconds($stats['geocode_jobs_dispatched'] * 2));
                            $stats['geocode_jobs_dispatched']++;
                        }
                    }
                }
                $city = $cityCache[$cityKey];

                // Create neighborhood if Community differs from City
                if (! empty($communityName) && $communityName !== $cityName) {
                    $neighborhoodCreated = false;
                    $neighborhoodKey = $cityKey.'-'.Str::slug($communityName);
                    $metadata = $storeMetadata ? $this->buildMetadata($row) : null;

                    $neighborhood = $this->findOrCreateRegion(
                        name: $communityName,
                        type: 'neighborhood',
                        parentId: $city->id,
                        isActive: $markActive,
                        created: $neighborhoodCreated,
                        slugSuffix: "{$cityName}-{$stateAbbr}",
                        metadata: $metadata
                    );

                    if ($neighborhoodCreated) {
                        $stats['neighborhoods_created']++;

                        if ($enableGeocoding) {
                            GeocodeRegionJob::dispatch($neighborhood)->delay(now()->addSeconds($stats['geocode_jobs_dispatched'] * 2));
                            $stats['geocode_jobs_dispatched']++;
                        }
                    }
                }
            } catch (Throwable $e) {
                Log::error('ProcessRegionImportJob: Error processing row', [
                    'row' => $row,
                    'error' => $e->getMessage(),
                ]);
                $stats['skipped']++;
            }
        }

        // Also geocode states and counties if enabled
        if ($enableGeocoding) {
            foreach ($stateCache as $state) {
                if ($state->latitude === null) {
                    GeocodeRegionJob::dispatch($state)->delay(now()->addSeconds($stats['geocode_jobs_dispatched'] * 2));
                    $stats['geocode_jobs_dispatched']++;
                }
            }
            foreach ($countyCache as $county) {
                if ($county->latitude === null) {
                    GeocodeRegionJob::dispatch($county)->delay(now()->addSeconds($stats['geocode_jobs_dispatched'] * 2));
                    $stats['geocode_jobs_dispatched']++;
                }
            }
        }

        Log::info('ProcessRegionImportJob: Import completed', $stats);

        // Send notification to user
        $this->sendCompletionNotification($stats);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('ProcessRegionImportJob: Job failed', [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);

        if ($this->userId) {
            $user = User::find($this->userId);
            if ($user) {
                Notification::make()
                    ->title('Region Import Failed')
                    ->body('The region import job failed: '.$exception->getMessage())
                    ->danger()
                    ->sendToDatabase($user);
            }
        }
    }

    /**
     * Find or create a region
     */
    private function findOrCreateRegion(
        string $name,
        string $type,
        ?string $parentId,
        bool $isActive,
        bool &$created,
        string $slugSuffix = '',
        ?array $metadata = null
    ): Region {
        $slug = Str::slug($name);
        if ($slugSuffix) {
            $slug .= '-'.Str::slug($slugSuffix);
        }

        $existing = Region::where('slug', $slug)->first();

        if ($existing) {
            $created = false;

            return $existing;
        }

        $created = true;

        return Region::create([
            'name' => $name,
            'slug' => $slug,
            'type' => $type,
            'parent_id' => $parentId,
            'is_active' => $isActive,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Build metadata array from CSV row
     *
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function buildMetadata(array $row): array
    {
        return [
            'import_source' => 'csv',
            'imported_at' => now()->toISOString(),
            'csv_data' => [
                'population' => isset($row['Population']) ? (int) $row['Population'] : null,
                'est_smbs' => isset($row['Est_SMBs']) ? (int) $row['Est_SMBs'] : null,
                'type' => $row['Type'] ?? null,
                'notes' => $row['Notes'] ?? null,
                'day' => isset($row['Day']) ? (int) $row['Day'] : null,
                'date' => $row['Date'] ?? null,
            ],
        ];
    }

    /**
     * Send completion notification to the user
     *
     * @param  array<string, int>  $stats
     */
    private function sendCompletionNotification(array $stats): void
    {
        if (! $this->userId) {
            return;
        }

        $user = User::find($this->userId);
        if (! $user) {
            return;
        }

        $totalCreated = $stats['states_created'] + $stats['counties_created'] +
            $stats['cities_created'] + $stats['neighborhoods_created'];

        Notification::make()
            ->title('Region Import Completed')
            ->body(sprintf(
                'Created %d regions (%d states, %d counties, %d cities, %d neighborhoods). %d geocoding jobs queued.',
                $totalCreated,
                $stats['states_created'],
                $stats['counties_created'],
                $stats['cities_created'],
                $stats['neighborhoods_created'],
                $stats['geocode_jobs_dispatched']
            ))
            ->success()
            ->sendToDatabase($user);
    }
}

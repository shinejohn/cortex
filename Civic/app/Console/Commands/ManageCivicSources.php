<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\News\ProcessCivicSourcesJob;
use App\Jobs\News\ProcessSingleCivicSourceJob;
use App\Models\CivicContentItem;
use App\Models\CivicSource;
use App\Models\CivicSourcePlatform;
use App\Models\Region;
use App\Services\Civic\CivicSourceCollectionService;
use App\Services\Civic\LegistarService;
use Illuminate\Console\Command;

class ManageCivicSources extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'civic:sources
                            {action : Action to perform (list|collect|discover|add|test|stats)}
                            {--region= : Region ID or name}
                            {--source= : Civic source ID}
                            {--platform= : Platform name (civicplus|legistar|nixle)}
                            {--sync : Run synchronously instead of queueing}
                            {--url= : URL for adding CivicPlus source}
                            {--client= : Client name for adding Legistar source}
                            {--zip= : ZIP codes for Nixle (comma-separated)}
                            {--name= : Name for new source}';

    /**
     * The console command description.
     */
    protected $description = 'Manage civic source collection (CivicPlus, Legistar, Nixle)';

    public function __construct(
        private readonly CivicSourceCollectionService $collectionService,
        private readonly LegistarService $legistarService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $action = $this->argument('action');

        return match ($action) {
            'list' => $this->listSources(),
            'collect' => $this->collectFromSources(),
            'discover' => $this->discoverSources(),
            'add' => $this->addSource(),
            'test' => $this->testSource(),
            'stats' => $this->showStats(),
            default => $this->invalidAction($action),
        };
    }

    /**
     * List civic sources
     */
    private function listSources(): int
    {
        $query = CivicSource::with('platform', 'region');

        if ($regionId = $this->option('region')) {
            $region = $this->findRegion($regionId);
            if (!$region) {
                $this->error("Region not found: {$regionId}");
                return 1;
            }
            $query->forRegion($region);
        }

        if ($platformName = $this->option('platform')) {
            $query->forPlatform($platformName);
        }

        $sources = $query->get();

        if ($sources->isEmpty()) {
            $this->info('No civic sources found.');
            return 0;
        }

        $this->table(
            ['ID', 'Name', 'Platform', 'Region', 'Type', 'Enabled', 'Health', 'Last Collected', 'Items'],
            $sources->map(fn($s) => [
                substr($s->id, 0, 8) . '...',
                \Illuminate\Support\Str::limit($s->name, 30),
                $s->platform->name ?? 'N/A',
                $s->region->name ?? 'N/A',
                $s->source_type,
                $s->is_enabled ? '✓' : '✗',
                $s->health_score . '%',
                $s->last_collected_at?->diffForHumans() ?? 'Never',
                $s->last_items_found,
            ])
        );

        return 0;
    }

    /**
     * Collect from civic sources
     */
    private function collectFromSources(): int
    {
        $sync = $this->option('sync');

        // Collect from specific source
        if ($sourceId = $this->option('source')) {
            $source = CivicSource::find($sourceId);
            if (!$source) {
                $this->error("Source not found: {$sourceId}");
                return 1;
            }

            $this->info("Collecting from source: {$source->name}");

            if ($sync) {
                $results = $this->collectionService->collectFromSource($source);
                $this->displayResults($results);
            } else {
                ProcessSingleCivicSourceJob::dispatch($source);
                $this->info('Job dispatched to queue.');
            }

            return 0;
        }

        // Collect from all sources in a region
        if ($regionId = $this->option('region')) {
            $region = $this->findRegion($regionId);
            if (!$region) {
                $this->error("Region not found: {$regionId}");
                return 1;
            }

            $this->info("Collecting from all civic sources in: {$region->name}");

            if ($sync) {
                $results = $this->collectionService->collectForRegion($region);
                $this->displayResults($results);
            } else {
                ProcessCivicSourcesJob::dispatch($region);
                $this->info('Job dispatched to queue.');
            }

            return 0;
        }

        // Collect from all enabled sources
        $this->info('Collecting from all enabled civic sources...');

        $regions = Region::whereHas('civicSources', fn($q) => $q->enabled())->get();

        foreach ($regions as $region) {
            $this->line("  Dispatching for: {$region->name}");
            ProcessCivicSourcesJob::dispatch($region);
        }

        $this->info("Dispatched jobs for {$regions->count()} regions.");

        return 0;
    }

    /**
     * Discover civic sources for a region
     */
    private function discoverSources(): int
    {
        $regionId = $this->option('region');

        if (!$regionId) {
            $this->error('Please specify a region with --region');
            return 1;
        }

        $region = $this->findRegion($regionId);
        if (!$region) {
            $this->error("Region not found: {$regionId}");
            return 1;
        }

        $this->info("Discovering civic sources for: {$region->name}");

        $discovered = $this->collectionService->discoverSourcesForRegion($region);

        $this->newLine();

        if ($discovered['legistar']) {
            $this->info("✓ Legistar source created: {$discovered['legistar']->api_client_name}");
        } else {
            $this->line("✗ No Legistar client found");
        }

        if (!empty($discovered['civicplus'])) {
            foreach ($discovered['civicplus'] as $source) {
                $this->info("✓ CivicPlus source created: {$source->base_url}");
            }
        } else {
            $this->line("✗ No CivicPlus sites found");
        }

        if ($discovered['nixle']) {
            $this->info("✓ Nixle source created for ZIP codes: {$discovered['nixle']->zip_codes}");
        } else {
            $this->line("✗ No ZIP codes available for Nixle");
        }

        return 0;
    }

    /**
     * Add a civic source manually
     */
    private function addSource(): int
    {
        $platformName = $this->option('platform');
        $regionId = $this->option('region');

        if (!$platformName || !$regionId) {
            $this->error('Please specify --platform and --region');
            return 1;
        }

        $region = $this->findRegion($regionId);
        if (!$region) {
            $this->error("Region not found: {$regionId}");
            return 1;
        }

        $platform = CivicSourcePlatform::byName($platformName);
        if (!$platform) {
            $this->error("Platform not found: {$platformName}");
            return 1;
        }

        $name = $this->option('name') ?? "{$region->name} - {$platform->display_name}";

        return match ($platformName) {
            'legistar' => $this->addLegistarSource($region, $platform, $name),
            'civicplus' => $this->addCivicPlusSource($region, $platform, $name),
            'nixle' => $this->addNixleSource($region, $platform, $name),
            default => $this->error("Unknown platform: {$platformName}") ?? 1,
        };
    }

    /**
     * Add Legistar source
     */
    private function addLegistarSource(Region $region, CivicSourcePlatform $platform, string $name): int
    {
        $client = $this->option('client');

        if (!$client) {
            // Try to discover
            $this->info('No client specified, attempting discovery...');
            $client = $this->legistarService->discoverClient($region->name, $region->state ?? null);
        }

        if (!$client) {
            $this->error('Could not find Legistar client. Use --client to specify manually.');
            return 1;
        }

        // Verify client works
        if (!$this->legistarService->testClient($client)) {
            $this->error("Legistar client not accessible: {$client}");
            return 1;
        }

        $source = CivicSource::create([
            'region_id' => $region->id,
            'platform_id' => $platform->id,
            'name' => $name,
            'source_type' => CivicSource::TYPE_API,
            'entity_type' => CivicSource::ENTITY_CITY,
            'api_endpoint' => "https://webapi.legistar.com/v1/{$client}",
            'api_client_name' => $client,
            'poll_interval_minutes' => 120,
            'is_enabled' => true,
            'auto_discovered' => false,
        ]);

        $this->info("Created Legistar source: {$source->id}");
        $this->line("  Client: {$client}");
        $this->line("  API: {$source->api_endpoint}");

        return 0;
    }

    /**
     * Add CivicPlus source
     */
    private function addCivicPlusSource(Region $region, CivicSourcePlatform $platform, string $name): int
    {
        $url = $this->option('url');

        if (!$url) {
            $this->error('Please specify --url for CivicPlus source');
            return 1;
        }

        $source = CivicSource::create([
            'region_id' => $region->id,
            'platform_id' => $platform->id,
            'name' => $name,
            'source_type' => CivicSource::TYPE_RSS,
            'entity_type' => CivicSource::ENTITY_CITY,
            'base_url' => $url,
            'rss_feed_url' => rtrim($url, '/') . '/rss.aspx',
            'poll_interval_minutes' => 60,
            'is_enabled' => true,
            'auto_discovered' => false,
        ]);

        $this->info("Created CivicPlus source: {$source->id}");
        $this->line("  URL: {$url}");
        $this->line("  RSS: {$source->rss_feed_url}");

        return 0;
    }

    /**
     * Add Nixle source
     */
    private function addNixleSource(Region $region, CivicSourcePlatform $platform, string $name): int
    {
        $zipCodes = $this->option('zip');

        if (!$zipCodes) {
            $this->error('Please specify --zip for Nixle source (comma-separated ZIP codes)');
            return 1;
        }

        $source = CivicSource::create([
            'region_id' => $region->id,
            'platform_id' => $platform->id,
            'name' => $name,
            'source_type' => CivicSource::TYPE_SCRAPE,
            'entity_type' => CivicSource::ENTITY_POLICE,
            'zip_codes' => $zipCodes,
            'poll_interval_minutes' => 30,
            'is_enabled' => true,
            'auto_discovered' => false,
        ]);

        $this->info("Created Nixle source: {$source->id}");
        $this->line("  ZIP Codes: {$zipCodes}");

        return 0;
    }

    /**
     * Test a civic source
     */
    private function testSource(): int
    {
        // Test Legistar client
        if ($client = $this->option('client')) {
            $this->info("Testing Legistar client: {$client}");

            if ($this->legistarService->testClient($client)) {
                $this->info("✓ Client is accessible!");

                // Fetch some data
                $source = new CivicSource(['api_client_name' => $client]);
                try {
                    $events = $this->legistarService->fetchEvents($source, 7);
                    $this->line("  Found {$events->count()} upcoming events");
                } catch (\Exception $e) {
                    $this->warn("  Could not fetch events: {$e->getMessage()}");
                }
            } else {
                $this->error("✗ Client not accessible");
            }

            return 0;
        }

        // Test specific source
        if ($sourceId = $this->option('source')) {
            $source = CivicSource::with('platform')->find($sourceId);
            if (!$source) {
                $this->error("Source not found: {$sourceId}");
                return 1;
            }

            $this->info("Testing source: {$source->name}");
            $this->line("  Platform: {$source->platform->name}");
            $this->line("  Type: {$source->source_type}");

            try {
                $results = $this->collectionService->collectFromSource($source);
                $this->info("✓ Collection successful!");
                $this->displayResults($results);
            } catch (\Exception $e) {
                $this->error("✗ Collection failed: {$e->getMessage()}");
                return 1;
            }

            return 0;
        }

        $this->error('Please specify --source or --client to test');
        return 1;
    }

    /**
     * Show statistics
     */
    private function showStats(): int
    {
        $regionId = $this->option('region');

        if ($regionId) {
            $region = $this->findRegion($regionId);
            if (!$region) {
                $this->error("Region not found: {$regionId}");
                return 1;
            }

            $stats = $this->collectionService->getStatistics($region);

            $this->info("Civic Source Statistics for: {$region->name}");
            $this->newLine();

            $this->table(
                ['Metric', 'Value'],
                collect($stats)->map(fn($v, $k) => [
                    str_replace('_', ' ', ucwords($k, '_')),
                    $v,
                ])->toArray()
            );

            return 0;
        }

        // Global stats
        $this->info('Global Civic Source Statistics');
        $this->newLine();

        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Platforms', CivicSourcePlatform::count()],
                ['Total Sources', CivicSource::count()],
                ['Enabled Sources', CivicSource::enabled()->count()],
                ['Healthy Sources (>50%)', CivicSource::healthy()->count()],
                ['Total Content Items', CivicContentItem::count()],
                ['Pending Items', CivicContentItem::pending()->count()],
                ['Items (7 days)', CivicContentItem::recent(7)->count()],
                ['Alerts (7 days)', CivicContentItem::alerts()->recent(7)->count()],
            ]
        );

        $this->newLine();
        $this->info('Sources by Platform:');

        foreach (CivicSourcePlatform::withCount('sources')->get() as $platform) {
            $this->line("  {$platform->display_name}: {$platform->sources_count}");
        }

        return 0;
    }

    /**
     * Find a region by ID or name
     */
    private function findRegion(string $identifier): ?Region
    {
        // Try by UUID first
        $region = Region::find($identifier);

        if (!$region) {
            // Try by name
            $region = Region::where('name', 'LIKE', "%{$identifier}%")->first();
        }

        return $region;
    }

    /**
     * Display collection results
     */
    private function displayResults(array $results): void
    {
        $this->newLine();
        $this->table(
            ['Metric', 'Value'],
            collect($results)->map(fn($v, $k) => [
                str_replace('_', ' ', ucwords($k, '_')),
                is_array($v) ? count($v) . ' errors' : $v,
            ])->toArray()
        );
    }

    /**
     * Handle invalid action
     */
    private function invalidAction(string $action): int
    {
        $this->error("Invalid action: {$action}");
        $this->line('Valid actions: list, collect, discover, add, test, stats');
        return 1;
    }
}

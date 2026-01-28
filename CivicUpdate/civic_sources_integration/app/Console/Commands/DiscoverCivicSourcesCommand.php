<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Region;
use App\Services\Civic\PerplexityDiscoveryService;
use Illuminate\Console\Command;

/**
 * Discover Civic Sources at Scale using Perplexity AI
 * 
 * Uses Perplexity Sonar API to intelligently find government websites,
 * Granicus meeting portals, Legistar APIs, CivicPlus sites, and Nixle coverage
 * for cities, counties, or entire states.
 */
class DiscoverCivicSourcesCommand extends Command
{
    protected $signature = 'civic:discover
                            {scope : Discovery scope (city|county|state)}
                            {name : City name, county name, or state abbreviation}
                            {--state= : State abbreviation (required for city/county)}
                            {--limit=50 : Max cities for state discovery}
                            {--create : Create CivicSource records from discoveries}
                            {--region= : Region ID to associate sources with}
                            {--dry-run : Show what would be discovered without saving}';

    protected $description = 'Discover civic sources at scale using Perplexity AI';

    public function __construct(
        private readonly PerplexityDiscoveryService $discoveryService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        if (!$this->discoveryService->isConfigured()) {
            $this->error('Perplexity API key not configured.');
            $this->line('Set PERPLEXITY_API_KEY in your .env file.');
            return 1;
        }

        $scope = $this->argument('scope');
        $name = $this->argument('name');

        return match ($scope) {
            'city' => $this->discoverCity($name),
            'county' => $this->discoverCounty($name),
            'state' => $this->discoverState($name),
            default => $this->invalidScope($scope),
        };
    }

    /**
     * Discover sources for a single city
     */
    private function discoverCity(string $cityName): int
    {
        $state = $this->option('state');

        if (!$state) {
            $this->error('--state is required for city discovery');
            return 1;
        }

        $this->info("Discovering civic sources for {$cityName}, {$state}...");
        $this->newLine();

        try {
            $discovery = $this->discoveryService->discoverForCity($cityName, $state);
            $this->displayDiscovery($discovery);

            if ($this->option('create') && !$this->option('dry-run')) {
                $this->createSources($discovery, $cityName, $state);
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("Discovery failed: {$e->getMessage()}");
            return 1;
        }
    }

    /**
     * Discover sources for all cities in a county
     */
    private function discoverCounty(string $countyName): int
    {
        $state = $this->option('state');

        if (!$state) {
            $this->error('--state is required for county discovery');
            return 1;
        }

        $this->info("Discovering civic sources for all cities in {$countyName} County, {$state}...");
        $this->newLine();

        try {
            $discoveries = $this->discoveryService->discoverForCounty($countyName, $state);

            $this->displayCountyResults($discoveries);

            if ($this->option('create') && !$this->option('dry-run')) {
                $this->createSourcesFromBatch($discoveries);
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("Discovery failed: {$e->getMessage()}");
            return 1;
        }
    }

    /**
     * Discover sources for major cities in a state
     */
    private function discoverState(string $state): int
    {
        $limit = (int) $this->option('limit');

        $this->info("Discovering civic sources for top {$limit} cities in {$state}...");
        $this->newLine();

        try {
            $discoveries = $this->discoveryService->discoverForState($state, $limit);

            $this->displayCountyResults($discoveries);

            if ($this->option('create') && !$this->option('dry-run')) {
                $this->createSourcesFromBatch($discoveries);
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("Discovery failed: {$e->getMessage()}");
            return 1;
        }
    }

    /**
     * Display discovery results for a single city
     */
    private function displayDiscovery(array $discovery): void
    {
        $this->line("<fg=cyan>Official Website:</> " . ($discovery['official_website'] ?? 'Not found'));
        $this->newLine();

        // Granicus
        if (!empty($discovery['granicus'])) {
            $this->info("✓ Granicus MediaManager Found");
            $this->line("  Host: {$discovery['granicus']['host']}");
            $this->line("  Publishers: " . count($discovery['granicus']['publishers'] ?? []));
            $this->line("  RSS Feeds: " . count($discovery['granicus']['feeds'] ?? []));
            
            foreach ($discovery['granicus']['publishers'] ?? [] as $pub) {
                $this->line("    - [{$pub['view_id']}] {$pub['name']}");
            }
        } else {
            $this->line("✗ Granicus MediaManager: Not found");
        }
        $this->newLine();

        // Legistar
        if (!empty($discovery['legistar'])) {
            $this->info("✓ Legistar API Found");
            $this->line("  Client: {$discovery['legistar']['client']}");
            $this->line("  API: {$discovery['legistar']['api_url']}");
            $this->line("  Portal: {$discovery['legistar']['portal_url']}");
        } else {
            $this->line("✗ Legistar API: Not found");
        }
        $this->newLine();

        // CivicPlus
        if (!empty($discovery['civicplus'])) {
            $this->info("✓ CivicPlus Site Found");
            $this->line("  URL: {$discovery['civicplus']['url']}");
            $this->line("  RSS Feeds: " . count($discovery['civicplus']['feeds'] ?? []));
        } else {
            $this->line("✗ CivicPlus: Not found");
        }
        $this->newLine();

        // Nixle
        if (!empty($discovery['nixle_zip_codes'])) {
            $this->info("✓ ZIP Codes for Nixle");
            $this->line("  ZIP Codes: " . implode(', ', $discovery['nixle_zip_codes']));
        } else {
            $this->line("✗ Nixle ZIP Codes: Not found");
        }

        if (!empty($discovery['notes'])) {
            $this->newLine();
            $this->line("<fg=yellow>Notes:</> {$discovery['notes']}");
        }
    }

    /**
     * Display results for county/state discovery
     */
    private function displayCountyResults($discoveries): void
    {
        $summary = [
            'total' => $discoveries->count(),
            'granicus' => 0,
            'legistar' => 0,
            'civicplus' => 0,
            'errors' => 0,
        ];

        $this->table(
            ['City', 'Granicus', 'Legistar', 'CivicPlus', 'Nixle ZIPs'],
            $discoveries->map(function ($item) use (&$summary) {
                if (!empty($item['error'])) {
                    $summary['errors']++;
                    return [
                        $item['city'],
                        '❌',
                        '❌',
                        '❌',
                        'Error: ' . \Illuminate\Support\Str::limit($item['error'], 20),
                    ];
                }

                $d = $item['discovery'];
                
                if (!empty($d['granicus'])) $summary['granicus']++;
                if (!empty($d['legistar'])) $summary['legistar']++;
                if (!empty($d['civicplus'])) $summary['civicplus']++;

                return [
                    $item['city'],
                    !empty($d['granicus']) ? '✓ ' . count($d['granicus']['feeds'] ?? []) . ' feeds' : '—',
                    !empty($d['legistar']) ? '✓ ' . $d['legistar']['client'] : '—',
                    !empty($d['civicplus']) ? '✓ ' . count($d['civicplus']['feeds'] ?? []) . ' feeds' : '—',
                    count($d['nixle_zip_codes'] ?? []) ?: '—',
                ];
            })->toArray()
        );

        $this->newLine();
        $this->info("Summary:");
        $this->line("  Total cities: {$summary['total']}");
        $this->line("  Granicus found: {$summary['granicus']}");
        $this->line("  Legistar found: {$summary['legistar']}");
        $this->line("  CivicPlus found: {$summary['civicplus']}");
        $this->line("  Errors: {$summary['errors']}");
    }

    /**
     * Create CivicSource records from a single discovery
     */
    private function createSources(array $discovery, string $cityName, string $state): void
    {
        $regionId = $this->option('region');
        
        if (!$regionId) {
            // Try to find or create region
            $region = Region::where('name', 'like', "%{$cityName}%")->first();
            
            if (!$region) {
                $this->warn("No region found for {$cityName}. Use --region to specify.");
                return;
            }
            
            $regionId = $region->id;
        }

        $region = Region::find($regionId);
        if (!$region) {
            $this->error("Region not found: {$regionId}");
            return;
        }

        $created = $this->discoveryService->createSourcesFromDiscovery($discovery, $region);

        $this->newLine();
        $this->info("Created " . count(array_filter($created)) . " CivicSource records:");
        
        foreach ($created as $type => $source) {
            if ($source) {
                $this->line("  ✓ {$type}: {$source->name}");
            }
        }
    }

    /**
     * Create sources from batch discoveries
     */
    private function createSourcesFromBatch($discoveries): void
    {
        $this->newLine();
        $this->info("Creating CivicSource records...");

        $totalCreated = 0;

        foreach ($discoveries as $item) {
            if (!empty($item['error'])) {
                continue;
            }

            $cityName = $item['city'];
            $state = $item['state'];
            
            // Find region for this city
            $region = Region::where('name', 'like', "%{$cityName}%")->first();
            
            if (!$region) {
                $this->line("  Skipping {$cityName}: no matching region");
                continue;
            }

            $created = $this->discoveryService->createSourcesFromDiscovery(
                $item['discovery'],
                $region
            );

            $count = count(array_filter($created));
            $totalCreated += $count;

            if ($count > 0) {
                $this->line("  ✓ {$cityName}: {$count} sources");
            }
        }

        $this->newLine();
        $this->info("Total sources created: {$totalCreated}");
    }

    /**
     * Handle invalid scope
     */
    private function invalidScope(string $scope): int
    {
        $this->error("Invalid scope: {$scope}");
        $this->line("Valid scopes: city, county, state");
        return 1;
    }
}

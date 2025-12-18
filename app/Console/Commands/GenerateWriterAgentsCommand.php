<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\WriterAgent;
use App\Services\WriterAgent\AgentGenerationService;
use Exception;
use Illuminate\Console\Command;

final class GenerateWriterAgentsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'agents:generate
                            {--count=1 : Number of agents to generate}
                            {--dry-run : Preview without creating}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate AI writer agents with smart auto-assignment to underserved regions and categories';

    public function __construct(
        private readonly AgentGenerationService $generationService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = (int) $this->option('count');
        $dryRun = (bool) $this->option('dry-run');

        $this->info("Generating {$count} writer agent(s)...");

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No agents will be created');
        }

        // Show current gaps
        $gaps = $this->generationService->identifyGaps();

        $this->newLine();
        $this->info('Current Coverage Gaps:');

        $this->table(
            ['Underserved Regions'],
            $gaps['regions']->map(fn ($r) => [$r->name])->toArray()
        );

        $this->table(
            ['Underserved Categories'],
            collect($gaps['categories'])->map(fn ($c) => [$c])->toArray()
        );

        $this->newLine();

        $generated = [];

        for ($i = 0; $i < $count; $i++) {
            $this->info('Generating agent '.($i + 1)." of {$count}...");

            if ($dryRun) {
                $this->line('  Would generate agent with:');
                $this->line('  - Regions: '.implode(', ', $gaps['regions']->take(3)->pluck('name')->toArray()));
                $this->line('  - Categories: '.implode(', ', array_slice($gaps['categories'], 0, 4)));

                continue;
            }

            try {
                $agent = $this->generationService->generateAgent();
                $generated[] = $agent;

                $this->info("  Created: {$agent->name}");
                $this->line("    - ID: {$agent->id}");
                $this->line('    - Style: '.$agent->writing_style);
                $this->line('    - Categories: '.implode(', ', $agent->categories));
                $this->line('    - Regions: '.$agent->regions->pluck('name')->implode(', '));
            } catch (Exception $e) {
                $this->error("  Failed to generate agent: {$e->getMessage()}");
            }
        }

        $this->newLine();

        if (! $dryRun && count($generated) > 0) {
            $this->info('Summary:');
            $this->table(
                ['Name', 'Style', 'Categories', 'Regions'],
                collect($generated)->map(fn (WriterAgent $a) => [
                    $a->name,
                    $a->writing_style,
                    implode(', ', array_slice($a->categories, 0, 3)),
                    $a->regions->pluck('name')->implode(', '),
                ])->toArray()
            );

            $this->info('Successfully generated '.count($generated).' agent(s).');
        }

        return self::SUCCESS;
    }
}

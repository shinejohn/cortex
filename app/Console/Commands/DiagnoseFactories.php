<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class DiagnoseFactories extends Command
{
    protected $signature = 'factories:diagnose 
                            {--fix : Generate missing factories}
                            {--model= : Check specific model only}
                            {--output= : Output file for report}';

    protected $description = 'Diagnose factory issues and generate fix order';

    private array $missingFactory = [];
    private array $factoryErrors = [];
    private array $workingFactories = [];
    private array $missingHasFactory = [];
    private array $modelDependencies = [];

    public function handle(): int
    {
        $this->info("\n" . str_repeat("=", 70));
        $this->info("FACTORY DIAGNOSTIC REPORT");
        $this->info(str_repeat("=", 70) . "\n");

        $models = $this->getModels();
        
        if ($specificModel = $this->option('model')) {
            $models = $models->filter(fn ($m) => class_basename($m) === $specificModel);
        }

        $this->info("Found {$models->count()} models\n");

        $bar = $this->output->createProgressBar($models->count());
        $bar->start();

        foreach ($models as $modelClass) {
            $this->analyzeModel($modelClass);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->outputSummary();
        $this->outputMissingFactories();
        $this->outputBrokenFactories();
        $this->outputFixOrder();
        $this->outputPrompt();

        if ($this->option('fix')) {
            $this->generateMissingFactories();
        }

        if ($outputFile = $this->option('output')) {
            $this->saveReport($outputFile);
        }

        return Command::SUCCESS;
    }

    private function getModels()
    {
        return collect(File::glob(app_path('Models/*.php')))
            ->map(fn ($file) => 'App\\Models\\' . basename($file, '.php'))
            ->filter(fn ($class) => class_exists($class) && is_subclass_of($class, Model::class))
            ->values();
    }

    private function analyzeModel(string $modelClass): void
    {
        $modelName = class_basename($modelClass);
        $factoryClass = "Database\\Factories\\{$modelName}Factory";

        // Check HasFactory trait
        $traits = class_uses_recursive($modelClass);
        if (!isset($traits[HasFactory::class])) {
            $this->missingHasFactory[] = $modelName;
            return;
        }

        // Check factory exists
        if (!class_exists($factoryClass)) {
            $this->missingFactory[] = $modelName;
            $this->recordDependencies($modelClass, $modelName);
            return;
        }

        // Try to create
        try {
            DB::beginTransaction();
            $modelClass::factory()->create();
            $this->workingFactories[] = $modelName;
            DB::rollBack();
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->factoryErrors[$modelName] = [
                'error' => $e->getMessage(),
                'class' => get_class($e),
            ];
            $this->recordDependencies($modelClass, $modelName);
        }
    }

    private function recordDependencies(string $modelClass, string $modelName): void
    {
        try {
            $model = new $modelClass;
            $table = $model->getTable();
            
            if (Schema::hasTable($table)) {
                $columns = Schema::getColumnListing($table);
                $foreignKeys = array_filter($columns, fn ($col) => str_ends_with($col, '_id'));
                $this->modelDependencies[$modelName] = array_map(function ($fk) {
                    $dep = str_replace('_id', '', $fk);
                    return str_replace(' ', '', ucwords(str_replace('_', ' ', $dep)));
                }, $foreignKeys);
            }
        } catch (\Throwable $e) {
            // Ignore
        }
    }

    private function outputSummary(): void
    {
        $this->info(str_repeat("=", 70));
        $this->info("SUMMARY");
        $this->info(str_repeat("=", 70));
        
        $this->line("✓ Working: <info>" . count($this->workingFactories) . "</info>");
        $this->line("✗ Missing: <error>" . count($this->missingFactory) . "</error>");
        $this->line("✗ Broken: <error>" . count($this->factoryErrors) . "</error>");
        $this->line("⚠ No HasFactory: <comment>" . count($this->missingHasFactory) . "</comment>");
    }

    private function outputMissingFactories(): void
    {
        if (empty($this->missingFactory)) {
            return;
        }

        $this->newLine();
        $this->warn("MISSING FACTORIES:");
        foreach ($this->missingFactory as $model) {
            $this->line("  - {$model}Factory");
        }
    }

    private function outputBrokenFactories(): void
    {
        if (empty($this->factoryErrors)) {
            return;
        }

        $this->newLine();
        $this->error("BROKEN FACTORIES:");
        foreach ($this->factoryErrors as $model => $error) {
            $this->line("\n  <error>{$model}</error>:");
            $shortError = substr($error['error'], 0, 100);
            $this->line("    {$shortError}");
            
            if (preg_match('/Column \'(\w+)\'/', $error['error'], $m)) {
                $this->line("    → <comment>Problem column: {$m[1]}</comment>");
            }
            if (preg_match('/REFERENCES `(\w+)`/', $error['error'], $m)) {
                $this->line("    → <comment>Missing FK to: {$m[1]}</comment>");
            }
        }
    }

    private function outputFixOrder(): void
    {
        $allBroken = array_merge($this->missingFactory, array_keys($this->factoryErrors));
        if (empty($allBroken)) {
            return;
        }

        $this->newLine();
        $this->info(str_repeat("=", 70));
        $this->info("FIX ORDER (dependencies first)");
        $this->info(str_repeat("=", 70));

        $fixOrder = $this->topologicalSort($allBroken);
        
        foreach ($fixOrder as $i => $model) {
            $status = in_array($model, $this->missingFactory) ? '<bg=red>CREATE</>' : '<bg=yellow>FIX</>';
            $deps = $this->modelDependencies[$model] ?? [];
            $depStr = !empty($deps) ? " → depends on: " . implode(', ', $deps) : "";
            $this->line(sprintf("  %2d. %s %s%s", $i + 1, $status, $model, $depStr));
        }
    }

    private function topologicalSort(array $nodes): array
    {
        $sorted = [];
        $visited = [];
        
        $visit = function ($node) use (&$visit, &$sorted, &$visited, $nodes) {
            if (isset($visited[$node])) {
                return;
            }
            $visited[$node] = true;
            
            $deps = $this->modelDependencies[$node] ?? [];
            foreach ($deps as $dep) {
                if (in_array($dep, $nodes)) {
                    $visit($dep);
                }
            }
            $sorted[] = $node;
        };
        
        foreach ($nodes as $node) {
            $visit($node);
        }
        
        return $sorted;
    }

    private function outputPrompt(): void
    {
        $allBroken = array_merge($this->missingFactory, array_keys($this->factoryErrors));
        if (empty($allBroken)) {
            return;
        }

        $this->newLine();
        $this->info(str_repeat("=", 70));
        $this->info("COPY THIS PROMPT TO CURSOR/CLAUDE:");
        $this->info(str_repeat("=", 70));
        $this->newLine();

        $fixOrder = $this->topologicalSort($allBroken);
        
        $prompt = "Fix/create these Laravel factories IN THIS ORDER:\n\n";
        foreach ($fixOrder as $i => $model) {
            $action = in_array($model, $this->missingFactory) ? "CREATE" : "FIX";
            $prompt .= ($i + 1) . ". {$action}: {$model}Factory";
            
            if (isset($this->factoryErrors[$model])) {
                $err = substr($this->factoryErrors[$model]['error'], 0, 80);
                $prompt .= "\n   Error: {$err}";
            }
            $prompt .= "\n";
        }
        
        $prompt .= "\nRules:\n";
        $prompt .= "- Define ALL required columns\n";
        $prompt .= "- Use factory() for foreign keys\n";
        $prompt .= "- Handle nullable fields\n";
        $prompt .= "- Add useful states\n";

        $this->line($prompt);
    }

    private function generateMissingFactories(): void
    {
        if (empty($this->missingFactory)) {
            return;
        }

        $this->newLine();
        $this->info("Generating missing factories...");

        foreach ($this->missingFactory as $model) {
            $this->call('make:factory', ['name' => "{$model}Factory"]);
        }

        $this->info("Generated " . count($this->missingFactory) . " factory stubs.");
        $this->warn("Note: You still need to fill in the definition() method!");
    }

    private function saveReport(string $file): void
    {
        $report = [
            'generated_at' => now()->toIso8601String(),
            'summary' => [
                'working' => count($this->workingFactories),
                'missing' => count($this->missingFactory),
                'broken' => count($this->factoryErrors),
            ],
            'working' => $this->workingFactories,
            'missing' => $this->missingFactory,
            'errors' => $this->factoryErrors,
            'fix_order' => $this->topologicalSort(
                array_merge($this->missingFactory, array_keys($this->factoryErrors))
            ),
        ];

        File::put($file, json_encode($report, JSON_PRETTY_PRINT));
        $this->info("\nReport saved to: {$file}");
    }
}


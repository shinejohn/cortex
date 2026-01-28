<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use ReflectionClass;

class AuditDataStructure extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:data-structure 
                            {--output= : Directory to output artifacts (defaults to storage/app/audit)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate data dictionaries from Database, Migrations, and Models to audit the data architecture.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Data Structure Audit...');

        $outputDir = $this->option('output') ?? storage_path('app/audit');
        if (!File::exists($outputDir)) {
            File::makeDirectory($outputDir, 0755, true);
        }

        // 1. Database Dictionary
        $this->info('Generating Database Dictionary...');
        $dbDictionary = $this->generateDatabaseDictionary();
        File::put("{$outputDir}/dictionary_database.json", json_encode($dbDictionary, JSON_PRETTY_PRINT));

        // 2. Migration Dictionary
        $this->info('Generating Migration Dictionary...');
        $migrationDictionary = $this->generateMigrationDictionary();
        File::put("{$outputDir}/dictionary_migrations.json", json_encode($migrationDictionary, JSON_PRETTY_PRINT));

        // 3. Model Dictionary
        $this->info('Generating Model Dictionary...');
        $modelDictionary = $this->generateModelDictionary();
        File::put("{$outputDir}/dictionary_models.json", json_encode($modelDictionary, JSON_PRETTY_PRINT));

        // 4. Generate Report
        $this->info('Generating Audit Report...');
        $report = $this->generateReport($dbDictionary, $migrationDictionary, $modelDictionary);
        File::put("{$outputDir}/data_audit_report.md", $report);

        $this->info("Audit complete! Artifacts saved to: {$outputDir}");
    }

    /**
     * Generate dictionary from actual Database Schema
     */
    private function generateDatabaseDictionary(): array
    {
        $tables = [];

        // Laravel 11+ Native Schema Introspection
        $tableList = Schema::getTables();

        foreach ($tableList as $table) {
            $tableName = $table['name'];

            $tables[$tableName] = [
                'columns' => Schema::getColumns($tableName),
                'indexes' => Schema::getIndexes($tableName),
            ];
        }

        return $tables;
    }

    /**
     * Generate dictionary from Migration files
     */
    private function generateMigrationDictionary(): array
    {
        $migrations = [];
        $files = File::files(database_path('migrations'));

        foreach ($files as $file) {
            $content = File::get($file);
            $filename = $file->getFilename();

            // Very basic regex parsing - not perfect but good for a "stateless" audit
            // Detect Schema::create('table_name'
            if (preg_match("/Schema::create\(['\"](.*?)['\"]/", $content, $matches)) {
                $tableName = $matches[1];
                $migrations[$tableName] = [
                    'file' => $filename,
                    'type' => 'create',
                    'columns' => $this->extractMigrationColumns($content),
                ];
            }

            // Detect Schema::table('table_name' (modifications)
            if (preg_match_all("/Schema::table\(['\"](.*?)['\"]/", $content, $matches)) {
                foreach ($matches[1] as $tableName) {
                    // We would append/modify existing definition here in a real robust parser
                    // For now, let's just note strictly strictly defined creations
                    if (!isset($migrations[$tableName])) {
                        $migrations[$tableName] = [
                            'file' => $filename . ' (modification)',
                            'type' => 'modify',
                            'columns' => [], // Complex to parse add/drop without full AST
                        ];
                    }
                }
            }
        }

        return $migrations;
    }

    private function extractMigrationColumns(string $content): array
    {
        $columns = [];
        // Match $table->string('name')...
        if (preg_match_all('/\$table->([a-zA-Z]+)\([\'"](.*?)[\'"]/', $content, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $type = $match[1];
                $name = $match[2];
                $columns[$name] = ['type' => $type];
            }
        }
        return $columns;
    }

    /**
     * Generate dictionary from Eloquent Models
     */
    private function generateModelDictionary(): array
    {
        $models = [];
        $path = app_path('Models');
        $files = File::allFiles($path);

        foreach ($files as $file) {
            $className = 'App\\Models\\' . str_replace(['/', '.php'], ['\\', ''], $file->getRelativePathname());

            if (class_exists($className)) {
                try {
                    $reflection = new ReflectionClass($className);
                    if (!$reflection->isSubclassOf('Illuminate\Database\Eloquent\Model') || $reflection->isAbstract()) {
                        continue;
                    }

                    $model = new $className;
                    $tableName = $model->getTable();

                    $models[$className] = [
                        'table' => $tableName,
                        'fillable' => $model->getFillable(),
                        'hidden' => $model->getHidden(),
                        'casts' => $model->getCasts(),
                        'relationships' => $this->inspectRelationships($reflection),
                    ];
                } catch (\Throwable $e) {
                    $this->warn("Skipping model {$className}: " . $e->getMessage());
                }
            }
        }

        return $models;
    }

    private function inspectRelationships(ReflectionClass $reflection): array
    {
        $relationships = [];
        foreach ($reflection->getMethods() as $method) {
            // Check if return type hints a Relation
            $returnType = $method->getReturnType();
            if ($returnType && str_contains($returnType->getName(), 'Illuminate\Database\Eloquent\Relations')) {
                $relationships[$method->getName()] = [
                    'type' => class_basename($returnType->getName()),
                ];
            }
        }
        return $relationships;
    }

    /**
     * Generate Markdown Report
     */
    private function generateReport(array $db, array $migrations, array $models): string
    {
        $report = "# Data Architecture Audit Report\n\n";
        $report .= "Generated: " . now()->toDateTimeString() . "\n\n";

        $report .= "## 1. Summary\n";
        $report .= "- Database Tables: " . count($db) . "\n";
        $report .= "- Migration Definitions: " . count($migrations) . "\n";
        $report .= "- Eloquent Models: " . count($models) . "\n\n";

        $report .= "## 2. Models without Database Tables (Crucial)\n";
        foreach ($models as $class => $info) {
            if (!isset($db[$info['table']])) {
                $report .= "- **{$class}** expects table `{$info['table']}` (Not Found in DB)\n";
            }
        }

        $report .= "\n## 3. Database Tables without Models (Potential Cleanup)\n";
        $tablesWithModels = array_column($models, 'table');
        foreach (array_keys($db) as $table) {
            if (!in_array($table, $tablesWithModels) && !in_array($table, ['migrations', 'failed_jobs', 'jobs', 'sessions', 'cache', 'audit_logs'])) {
                $report .= "- `{$table}`\n";
            }
        }

        // Add detailed comparison could go here in future iterations

        return $report;
    }
}

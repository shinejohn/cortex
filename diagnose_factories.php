<?php
/**
 * Factory Diagnostic Script
 * 
 * Run with: php artisan tinker < diagnose_factories.php
 * Or: php diagnose_factories.php (from project root, after bootstrapping Laravel)
 * 
 * This script will:
 * 1. Find all models
 * 2. Check if factories exist
 * 3. Try to instantiate each factory
 * 4. Report errors and missing relationships
 * 5. Output dependency order for fixing
 */

// If running standalone, bootstrap Laravel
if (!function_exists('app')) {
    require __DIR__ . '/vendor/autoload.php';
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
}

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

echo "\n" . str_repeat("=", 70) . "\n";
echo "FACTORY DIAGNOSTIC REPORT\n";
echo str_repeat("=", 70) . "\n\n";

// Collect all models
$modelPath = app_path('Models');
$models = collect(glob($modelPath . '/*.php'))
    ->map(function ($file) {
        return 'App\\Models\\' . basename($file, '.php');
    })
    ->filter(function ($class) {
        return class_exists($class) && is_subclass_of($class, Model::class);
    })
    ->values();

echo "Found " . $models->count() . " models\n\n";

// Analysis arrays
$missingFactory = [];
$factoryErrors = [];
$workingFactories = [];
$missingHasFactory = [];
$modelDependencies = [];

// Analyze each model
foreach ($models as $modelClass) {
    $modelName = class_basename($modelClass);
    $factoryClass = "Database\\Factories\\{$modelName}Factory";
    
    echo "Checking: {$modelName}... ";
    
    // Check if model uses HasFactory trait
    $traits = class_uses_recursive($modelClass);
    if (!isset($traits[HasFactory::class])) {
        $missingHasFactory[] = $modelName;
        echo "⚠ Missing HasFactory trait\n";
        continue;
    }
    
    // Check if factory class exists
    if (!class_exists($factoryClass)) {
        $missingFactory[] = $modelName;
        echo "✗ Factory not found\n";
        continue;
    }
    
    // Try to instantiate the factory and make a model
    try {
        // Get the factory definition without creating
        $factory = $modelClass::factory();
        $definition = $factory->definition();
        
        // Check for foreign keys that might need factories
        $model = new $modelClass;
        $table = $model->getTable();
        
        if (Schema::hasTable($table)) {
            $columns = Schema::getColumnListing($table);
            $foreignKeys = array_filter($columns, fn($col) => str_ends_with($col, '_id'));
            $modelDependencies[$modelName] = $foreignKeys;
        }
        
        // Try to actually create the model (in a transaction we'll rollback)
        \DB::beginTransaction();
        try {
            $instance = $modelClass::factory()->create();
            $workingFactories[] = $modelName;
            echo "✓ Working\n";
        } catch (\Throwable $e) {
            $factoryErrors[$modelName] = [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
            echo "✗ Create failed\n";
        }
        \DB::rollBack();
        
    } catch (\Throwable $e) {
        $factoryErrors[$modelName] = [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ];
        echo "✗ Error\n";
    }
}

// Output Reports
echo "\n" . str_repeat("=", 70) . "\n";
echo "SUMMARY\n";
echo str_repeat("=", 70) . "\n\n";

echo "✓ Working Factories: " . count($workingFactories) . "\n";
echo "✗ Missing Factories: " . count($missingFactory) . "\n";
echo "✗ Broken Factories: " . count($factoryErrors) . "\n";
echo "⚠ Missing HasFactory: " . count($missingHasFactory) . "\n";

// Missing Factories
if (!empty($missingFactory)) {
    echo "\n" . str_repeat("-", 70) . "\n";
    echo "MISSING FACTORIES (need to create)\n";
    echo str_repeat("-", 70) . "\n";
    foreach ($missingFactory as $model) {
        echo "  - {$model}Factory\n";
    }
}

// Missing HasFactory trait
if (!empty($missingHasFactory)) {
    echo "\n" . str_repeat("-", 70) . "\n";
    echo "MODELS MISSING HasFactory TRAIT\n";
    echo str_repeat("-", 70) . "\n";
    foreach ($missingHasFactory as $model) {
        echo "  - {$model}\n";
    }
}

// Broken Factories with errors
if (!empty($factoryErrors)) {
    echo "\n" . str_repeat("-", 70) . "\n";
    echo "BROKEN FACTORIES (need to fix)\n";
    echo str_repeat("-", 70) . "\n";
    foreach ($factoryErrors as $model => $error) {
        echo "\n  {$model}:\n";
        echo "    Error: " . substr($error['error'], 0, 200) . "\n";
        // Extract useful info from error
        if (str_contains($error['error'], 'SQLSTATE')) {
            preg_match('/Column \'(\w+)\'/', $error['error'], $matches);
            if (!empty($matches[1])) {
                echo "    → Missing/invalid column: {$matches[1]}\n";
            }
            preg_match('/foreign key constraint fails.*REFERENCES `(\w+)`/', $error['error'], $matches);
            if (!empty($matches[1])) {
                echo "    → Missing foreign key to: {$matches[1]}\n";
            }
        }
        if (str_contains($error['error'], 'Unknown column')) {
            preg_match('/Unknown column \'(\w+)\'/', $error['error'], $matches);
            if (!empty($matches[1])) {
                echo "    → Unknown column: {$matches[1]}\n";
            }
        }
    }
}

// Dependency Analysis
echo "\n" . str_repeat("=", 70) . "\n";
echo "DEPENDENCY ORDER (fix in this order)\n";
echo str_repeat("=", 70) . "\n";

// Build dependency graph
$allBroken = array_merge($missingFactory, array_keys($factoryErrors));
$dependencyGraph = [];

foreach ($modelDependencies as $model => $deps) {
    $dependencyGraph[$model] = [];
    foreach ($deps as $fk) {
        // Convert foreign key to model name (e.g., tenant_id -> Tenant)
        $depModel = str_replace('_id', '', $fk);
        $depModel = str_replace(' ', '', ucwords(str_replace('_', ' ', $depModel)));
        if (in_array($depModel, $allBroken)) {
            $dependencyGraph[$model][] = $depModel;
        }
    }
}

// Topological sort for fixing order
function topologicalSort($graph) {
    $sorted = [];
    $visited = [];
    $temp = [];
    
    $visit = function($node) use (&$visit, &$sorted, &$visited, &$temp, $graph) {
        if (isset($temp[$node])) return; // Cycle
        if (isset($visited[$node])) return;
        
        $temp[$node] = true;
        
        if (isset($graph[$node])) {
            foreach ($graph[$node] as $dep) {
                $visit($dep);
            }
        }
        
        unset($temp[$node]);
        $visited[$node] = true;
        $sorted[] = $node;
    };
    
    foreach (array_keys($graph) as $node) {
        if (!isset($visited[$node])) {
            $visit($node);
        }
    }
    
    return $sorted;
}

// Get fixing order
$fixOrder = topologicalSort($dependencyGraph);

// Add any broken models not in the dependency graph
foreach ($allBroken as $model) {
    if (!in_array($model, $fixOrder)) {
        array_unshift($fixOrder, $model);
    }
}

echo "\nFix these factories in order:\n\n";
$level = 0;
$currentDeps = [];
foreach ($fixOrder as $i => $model) {
    $deps = $dependencyGraph[$model] ?? [];
    $depStr = !empty($deps) ? " (depends on: " . implode(', ', $deps) . ")" : " (no dependencies)";
    $status = in_array($model, $missingFactory) ? "[CREATE]" : "[FIX]";
    echo sprintf("  %2d. %s %s%s\n", $i + 1, $status, $model, $depStr);
}

// Generate copy-paste prompt for Cursor/Claude
echo "\n" . str_repeat("=", 70) . "\n";
echo "COPY-PASTE PROMPT FOR AI ASSISTANT\n";
echo str_repeat("=", 70) . "\n\n";

$prompt = "I need you to create/fix the following Laravel factories in this EXACT order (dependencies must be created first):\n\n";

foreach ($fixOrder as $i => $model) {
    $status = in_array($model, $missingFactory) ? "CREATE" : "FIX";
    $deps = $dependencyGraph[$model] ?? [];
    $prompt .= ($i + 1) . ". {$status}: {$model}Factory";
    if (!empty($deps)) {
        $prompt .= " (depends on: " . implode(', ', $deps) . ")";
    }
    if (isset($factoryErrors[$model])) {
        $prompt .= "\n   Error: " . substr($factoryErrors[$model]['error'], 0, 150);
    }
    $prompt .= "\n";
}

$prompt .= "\nRequirements:\n";
$prompt .= "- Each factory must define ALL required database columns\n";
$prompt .= "- Use proper foreign key relationships with other factories\n";
$prompt .= "- Include common states (e.g., ->active(), ->withRelations())\n";
$prompt .= "- Handle nullable columns appropriately\n";
$prompt .= "- Use faker for realistic test data\n";

echo $prompt;

// Save report to file
$reportFile = storage_path('logs/factory_diagnostic_' . date('Y-m-d_H-i-s') . '.txt');
file_put_contents($reportFile, $prompt);
echo "\n\nFull report saved to: {$reportFile}\n";

echo "\n" . str_repeat("=", 70) . "\n";
echo "END OF DIAGNOSTIC\n";
echo str_repeat("=", 70) . "\n\n";


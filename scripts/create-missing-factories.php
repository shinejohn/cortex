<?php

/**
 * Create Missing Factories
 * Identifies models without factories and creates them
 */

$modelsPath = __DIR__ . '/../app/Models';
$factoriesPath = __DIR__ . '/../database/factories';

// Get all models
$models = glob($modelsPath . '/*.php');
$existingFactories = glob($factoriesPath . '/*Factory.php');

$existingFactoryNames = [];
foreach ($existingFactories as $factory) {
    $name = basename($factory, 'Factory.php');
    $existingFactoryNames[] = strtolower($name);
}

$missingFactories = [];

foreach ($models as $modelFile) {
    $modelName = basename($modelFile, '.php');
    
    // Skip abstract classes, traits, etc.
    if (in_array($modelName, ['Model', 'BaseModel'])) {
        continue;
    }
    
    // Check if factory exists
    if (!in_array(strtolower($modelName), $existingFactoryNames)) {
        $missingFactories[] = $modelName;
    }
}

echo "Found " . count($missingFactories) . " models without factories:\n\n";

foreach ($missingFactories as $model) {
    echo "  - {$model}\n";
}

echo "\nTo create factories, run:\n\n";

foreach ($missingFactories as $model) {
    echo "php artisan make:factory {$model}Factory --model={$model}\n";
}

echo "\nTotal missing: " . count($missingFactories) . "\n";




<?php

/**
 * Batch Implement All Model Tests
 * Systematically fills in all model test implementations
 */

$basePath = __DIR__ . '/../tests/Unit/Models/';
$modelsDir = __DIR__ . '/../app/Models/';

// Get all model files
$modelFiles = glob($modelsDir . '*.php');
$models = [];

foreach ($modelFiles as $file) {
    $modelName = basename($file, '.php');
    $models[] = $modelName;
}

$implemented = 0;
$skipped = 0;

foreach ($models as $model) {
    $testFile = $basePath . "{$model}Test.php";
    
    if (!file_exists($testFile)) {
        continue;
    }
    
    $content = file_get_contents($testFile);
    
    // Skip if already has comprehensive tests (more than 3 test functions)
    if (substr_count($content, 'test(') > 3) {
        $skipped++;
        continue;
    }
    
    // Generate basic tests
    $newContent = generateBasicModelTests($model);
    
    if ($newContent && $newContent !== $content) {
        file_put_contents($testFile, $newContent);
        $implemented++;
        echo "✅ Implemented: {$model}\n";
    } else {
        $skipped++;
    }
}

echo "\n✅ Batch implementation complete!\n";
echo "Implemented: {$implemented} models\n";
echo "Skipped: {$skipped} models\n";

function generateBasicModelTests($model) {
    $tests = "<?php\n\nuse App\Models\\{$model};\n\n";
    
    $tests .= "test('can create {$model}', function () {\n";
    $tests .= "    \$model = {$model}::factory()->create();\n";
    $tests .= "    expect(\$model)->toBeInstanceOf({$model}::class);\n";
    $tests .= "    expect(\$model->id)->toBeString();\n";
    $tests .= "});\n\n";
    
    $tests .= "test('{$model} has required attributes', function () {\n";
    $tests .= "    \$model = {$model}::factory()->create();\n";
    $tests .= "    expect(\$model->id)->toBeString();\n";
    $tests .= "    expect(\$model->created_at)->not->toBeNull();\n";
    $tests .= "});\n\n";
    
    $tests .= "test('{$model} can be updated', function () {\n";
    $tests .= "    \$model = {$model}::factory()->create();\n";
    $tests .= "    \$originalUpdated = \$model->updated_at;\n";
    $tests .= "    \n";
    $tests .= "    sleep(1);\n";
    $tests .= "    \$model->touch();\n";
    $tests .= "    \n";
    $tests .= "    expect(\$model->updated_at)->not->toBe(\$originalUpdated);\n";
    $tests .= "});\n";
    
    return $tests;
}


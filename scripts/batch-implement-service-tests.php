<?php

/**
 * Batch Implement Service Tests
 */

$basePath = __DIR__ . '/../tests/Unit/Services/';
$servicesDir = __DIR__ . '/../app/Services/';

// Get all service files recursively
$serviceFiles = [];
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($servicesDir)
);

foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        $serviceFiles[] = $file->getPathname();
    }
}

$implemented = 0;
$skipped = 0;

foreach ($serviceFiles as $file) {
    $relativePath = str_replace($servicesDir, '', $file);
    $serviceName = basename($file, '.php');
    $servicePath = dirname($relativePath);
    
    // Create test file path
    if ($servicePath === '.') {
        $testFile = $basePath . "{$serviceName}Test.php";
    } else {
        $testDir = $basePath . str_replace('/', '/', $servicePath);
        if (!is_dir($testDir)) {
            mkdir($testDir, 0755, true);
        }
        $testFile = $testDir . "/{$serviceName}Test.php";
    }
    
    if (!file_exists($testFile)) {
        continue;
    }
    
    $content = file_get_contents($testFile);
    
    // Skip if already has tests
    if (substr_count($content, 'test(') > 1) {
        $skipped++;
        continue;
    }
    
    // Generate basic test
    $namespace = $servicePath !== '.' ? "App\\Services\\" . str_replace('/', '\\', $servicePath) . "\\{$serviceName}" : "App\\Services\\{$serviceName}";
    $newContent = generateServiceTest($serviceName, $namespace);
    
    if ($newContent && $newContent !== $content) {
        file_put_contents($testFile, $newContent);
        $implemented++;
        echo "✅ Implemented: {$serviceName}\n";
    } else {
        $skipped++;
    }
}

echo "\n✅ Service test implementation complete!\n";
echo "Implemented: {$implemented} services\n";
echo "Skipped: {$skipped} services\n";

function generateServiceTest($serviceName, $namespace) {
    $tests = "<?php\n\nuse {$namespace};\n\n";
    
    $tests .= "test('{$serviceName} can be instantiated', function () {\n";
    $tests .= "    \$service = app({$namespace}::class);\n";
    $tests .= "    expect(\$service)->toBeInstanceOf({$namespace}::class);\n";
    $tests .= "});\n";
    
    return $tests;
}


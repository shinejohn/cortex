<?php

/**
 * Fix Common Test Issues
 * Addresses common problems in test files
 */

$basePath = __DIR__ . '/../tests/';

// Fix missing imports and common issues
$testFiles = glob($basePath . '**/*Test.php', GLOB_BRACE);

$fixed = 0;

foreach ($testFiles as $file) {
    $content = file_get_contents($file);
    $originalContent = $content;
    
    // Add missing use statements for common models
    if (strpos($content, 'User::factory') !== false && strpos($content, 'use App\\Models\\User') === false) {
        $content = preg_replace('/^<\?php\n/', "<?php\n\nuse App\\Models\\User;\n", $content);
    }
    
    if (strpos($content, 'Workspace::factory') !== false && strpos($content, 'use App\\Models\\Workspace') === false) {
        if (strpos($content, 'use App\\Models\\User') !== false) {
            $content = str_replace('use App\\Models\\User;', "use App\\Models\\User;\nuse App\\Models\\Workspace;", $content);
        } else {
            $content = preg_replace('/^<\?php\n/', "<?php\n\nuse App\\Models\\Workspace;\n", $content);
        }
    }
    
    // Fix common assertion issues
    $content = str_replace('expect($model)->toHaveKey(\'id\');', 'expect($model->id)->toBeString();', $content);
    
    if ($content !== $originalContent) {
        file_put_contents($file, $content);
        $fixed++;
        echo "✅ Fixed: " . basename($file) . "\n";
    }
}

echo "\n✅ Fixed {$fixed} test files\n";




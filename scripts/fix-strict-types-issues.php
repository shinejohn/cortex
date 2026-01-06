<?php

/**
 * Fix strict_types Declaration Issues
 */

$basePath = __DIR__ . '/../tests/';
$testFiles = glob($basePath . '**/*Test.php', GLOB_BRACE);

$fixed = 0;

foreach ($testFiles as $file) {
    $content = file_get_contents($file);
    $originalContent = $content;
    
    // Check if file has strict_types but not at the beginning
    if (preg_match('/^<\?php\s+.*declare\s*\(\s*strict_types\s*=\s*1\s*\)\s*;/m', $content)) {
        // Move strict_types to first line after <?php
        $content = preg_replace(
            '/^<\?php\s+(.*?)declare\s*\(\s*strict_types\s*=\s*1\s*\)\s*;\s*/m',
            "<?php\n\ndeclare(strict_types=1);\n\n$1",
            $content
        );
        
        // Also handle case where strict_types is after use statements
        if (preg_match('/^<\?php\n(use[^;]+;.*)\n\s*declare\s*\(\s*strict_types\s*=\s*1\s*\)\s*;/m', $content, $matches)) {
            $content = preg_replace(
                '/^<\?php\n(use[^;]+;.*)\n\s*declare\s*\(\s*strict_types\s*=\s*1\s*\)\s*;/m',
                "<?php\n\ndeclare(strict_types=1);\n\n$1",
                $content
            );
        }
    }
    
    if ($content !== $originalContent) {
        file_put_contents($file, $content);
        $fixed++;
        echo "✅ Fixed: " . basename($file) . "\n";
    }
}

echo "\n✅ Fixed {$fixed} files with strict_types issues\n";




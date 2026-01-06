<?php

/**
 * Fix Duplicate Migrations
 * Adds Schema::hasTable checks to prevent duplicate table creation errors
 */

$migrationsDir = __DIR__ . '/../database/migrations';
$files = glob($migrationsDir . '/*.php');

$tablesCreated = [];
$duplicates = [];

foreach ($files as $file) {
    $content = file_get_contents($file);
    
    // Find all Schema::create calls
    preg_match_all("/Schema::create\(['\"]([^'\"]+)['\"]/", $content, $matches);
    
    foreach ($matches[1] as $table) {
        if (isset($tablesCreated[$table])) {
            $duplicates[$table][] = basename($file);
        } else {
            $tablesCreated[$table] = basename($file);
        }
    }
}

echo "Checking for duplicate migrations...\n\n";

if (empty($duplicates)) {
    echo "✅ No duplicate table creations found!\n";
    exit(0);
}

echo "⚠️  Found duplicate table creations:\n\n";

foreach ($duplicates as $table => $files) {
    echo "Table: {$table}\n";
    echo "  First: {$tablesCreated[$table]}\n";
    foreach ($files as $file) {
        echo "  Duplicate: {$file}\n";
        
        // Fix the duplicate migration
        $filePath = $migrationsDir . '/' . $file;
        $content = file_get_contents($filePath);
        
        // Check if already has the guard
        if (strpos($content, 'Schema::hasTable') !== false) {
            echo "    ✅ Already has guard\n";
            continue;
        }
        
        // Add guard before Schema::create
        $pattern = "/(public function up\(\): void\s*\{)\s*(Schema::create\(['\"]{$table}['\"]\s*,)/";
        $replacement = "$1\n        if (Schema::hasTable('{$table}')) {\n            return;\n        }\n        \n        $2";
        
        $newContent = preg_replace($pattern, $replacement, $content);
        
        if ($newContent !== $content) {
            file_put_contents($filePath, $newContent);
            echo "    ✅ Fixed: Added Schema::hasTable guard\n";
        } else {
            echo "    ⚠️  Could not auto-fix (pattern mismatch)\n";
        }
    }
    echo "\n";
}

echo "✅ Duplicate migration fixes complete!\n";


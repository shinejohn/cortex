<?php

/**
 * Fix migrations that add columns that may already exist
 */

$migrationsDir = __DIR__ . '/../database/migrations';
$files = glob($migrationsDir . '/*add*users*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);
    
    // Check if it's an alter table migration
    if (strpos($content, "Schema::table('users'") === false) {
        continue;
    }
    
    // Check if it already has column checks
    if (strpos($content, 'Schema::hasColumn') !== false) {
        continue;
    }
    
    echo "Fixing: " . basename($file) . "\n";
    
    // Find all $table->addColumn or $table->string/etc calls
    // Wrap them in column existence checks
    $lines = explode("\n", $content);
    $newLines = [];
    $inTable = false;
    $columnsAdded = [];
    
    foreach ($lines as $line) {
        // Detect start of table modification
        if (preg_match("/Schema::table\('users'/", $line)) {
            $inTable = true;
            $newLines[] = $line;
            continue;
        }
        
        // Detect end of table modification
        if ($inTable && preg_match("/\}\);/", $line)) {
            // Add closing brace for column checks before final });
            $newLines[] = $line;
            $inTable = false;
            continue;
        }
        
        // Detect column additions
        if ($inTable && preg_match("/\$table->(string|text|integer|boolean|timestamp|date|json|uuid)\(['\"]([^'\"]+)['\"]/", $line, $matches)) {
            $columnName = $matches[2];
            if (!in_array($columnName, $columnsAdded)) {
                $columnsAdded[] = $columnName;
                $indent = str_repeat(' ', 12); // Match indentation
                $newLines[] = "{$indent}if (!Schema::hasColumn('users', '{$columnName}')) {";
                $newLines[] = $line;
                $newLines[] = "{$indent}}";
            } else {
                $newLines[] = $line;
            }
        } else {
            $newLines[] = $line;
        }
    }
    
    file_put_contents($file, implode("\n", $newLines));
    echo "  ✅ Fixed\n";
}

echo "\n✅ Column migration fixes complete!\n";


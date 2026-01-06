<?php

/**
 * Comprehensive Migration Fixer
 * Fixes all duplicate table/column issues
 */

$migrationsDir = __DIR__ . '/../database/migrations';
$files = glob($migrationsDir . '/*.php');

$fixed = 0;
$skipped = 0;

foreach ($files as $file) {
    $content = file_get_contents($file);
    $originalContent = $content;
    $fileFixed = false;
    
    // Fix Schema::create duplicates
    if (preg_match_all("/Schema::create\(['\"]([^'\"]+)['\"]/", $content, $matches)) {
        foreach ($matches[1] as $table) {
            // Check if guard already exists
            $pattern = "/Schema::create\(['\"]{$table}['\"]/";
            if (!preg_match("/if\s*\(.*Schema::hasTable.*{$table}/", $content)) {
                $content = preg_replace(
                    "/(public function up\(\): void\s*\{)\s*(Schema::create\(['\"]{$table}['\"])/",
                    "$1\n        if (Schema::hasTable('{$table}')) {\n            return;\n        }\n        \n        $2",
                    $content
                );
                $fileFixed = true;
            }
        }
    }
    
    // Fix Schema::table column additions
    if (preg_match("/Schema::table\(['\"]([^'\"]+)['\"]/", $content, $tableMatch)) {
        $table = $tableMatch[1];
        
        // Find all column additions
        if (preg_match_all("/\$table->(string|text|integer|boolean|timestamp|date|json|uuid|decimal|enum)\(['\"]([^'\"]+)['\"]/", $content, $colMatches)) {
            foreach ($colMatches[2] as $i => $column) {
                $columnType = $colMatches[1][$i];
                
                // Check if guard exists for this column
                if (!preg_match("/if\s*\(.*Schema::hasColumn.*{$column}/", $content)) {
                    // Wrap column addition in guard
                    $pattern = "/(\$table->{$columnType}\(['\"]{$column}['\"])/";
                    $replacement = "if (!Schema::hasColumn('{$table}', '{$column}')) {\n                $1";
                    
                    $content = preg_replace($pattern, $replacement, $content, 1);
                    
                    // Find the matching closing for this column addition
                    $lines = explode("\n", $content);
                    $newLines = [];
                    $inColumn = false;
                    $indentLevel = 0;
                    
                    foreach ($lines as $lineNum => $line) {
                        if (preg_match("/if\s*\(.*Schema::hasColumn.*{$column}/", $line)) {
                            $inColumn = true;
                            $indentLevel = strlen($line) - strlen(ltrim($line));
                        }
                        
                        $newLines[] = $line;
                        
                        if ($inColumn && preg_match("/\);$/", $line) && (strlen($line) - strlen(ltrim($line)) <= $indentLevel + 4)) {
                            $newLines[] = str_repeat(' ', $indentLevel) . "}";
                            $inColumn = false;
                        }
                    }
                    
                    $content = implode("\n", $newLines);
                    $fileFixed = true;
                }
            }
        }
    }
    
    // Fix ALTER TABLE enum modifications (PostgreSQL specific, skip for SQLite)
    if (preg_match("/DB::statement.*ALTER.*ENUM/i", $content)) {
        // Wrap in try-catch or check
        if (!preg_match("/try\s*\{|if\s*\(.*DB::/", $content)) {
            $content = preg_replace(
                "/(DB::statement\([^)]+ALTER[^)]+ENUM[^)]+\))/",
                "try {\n            $1;\n        } catch (\\Exception \$e) {\n            // Enum already exists or modified\n        }",
                $content
            );
            $fileFixed = true;
        }
    }
    
    if ($fileFixed && $content !== $originalContent) {
        file_put_contents($file, $content);
        $fixed++;
        echo "✅ Fixed: " . basename($file) . "\n";
    } else {
        $skipped++;
    }
}

echo "\n✅ Migration fixes complete!\n";
echo "Fixed: {$fixed} files\n";
echo "Skipped: {$skipped} files\n";


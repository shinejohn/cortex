<?php

/**
 * Comprehensive Factory Fix
 * Fixes all factories with proper field definitions based on model requirements
 */

$factoriesPath = __DIR__ . '/../database/factories';
$modelsPath = __DIR__ . '/../app/Models';

// Get all factory files
$factories = glob($factoriesPath . '/*Factory.php');

$fixed = 0;
$skipped = 0;

foreach ($factories as $factoryFile) {
    $factoryName = basename($factoryFile, 'Factory.php');
    $modelFile = $modelsPath . '/' . $factoryName . '.php';
    
    if (!file_exists($modelFile)) {
        continue;
    }
    
    $content = file_get_contents($factoryFile);
    
    // Skip if already has a proper definition
    if (strpos($content, "return [\n") !== false && strpos($content, '//') === false) {
        // Check if it has actual fields (not just empty)
        if (preg_match('/return\s*\[[^\]]+\w+[^\]]+\];/s', $content)) {
            $skipped++;
            continue;
        }
    }
    
    // Read model to understand required fields
    $modelContent = file_get_contents($modelFile);
    
    // Extract fillable fields
    preg_match('/protected\s+\$fillable\s*=\s*\[(.*?)\];/s', $modelContent, $matches);
    
    if (empty($matches[1])) {
        $skipped++;
        continue;
    }
    
    $fillableFields = [];
    preg_match_all("/'([^']+)'/", $matches[1], $fieldMatches);
    if (!empty($fieldMatches[1])) {
        $fillableFields = $fieldMatches[1];
    }
    
    if (empty($fillableFields)) {
        $skipped++;
        continue;
    }
    
    // Build factory definition
    $definition = "    public function definition(): array\n    {\n        return [\n";
    
    foreach ($fillableFields as $field) {
        // Skip timestamps and IDs (handled by Laravel)
        if (in_array($field, ['id', 'created_at', 'updated_at', 'deleted_at'])) {
            continue;
        }
        
        // Handle foreign keys
        if (str_ends_with($field, '_id')) {
            $relatedModel = str_replace('_id', '', $field);
            $relatedModel = str_replace('_', '', ucwords($relatedModel, '_'));
            $definition .= "            '{$field}' => \\App\\Models\\{$relatedModel}::factory(),\n";
            continue;
        }
        
        // Handle common field types
        if (str_contains($field, 'email')) {
            $definition .= "            '{$field}' => \$this->faker->email(),\n";
        } elseif (str_contains($field, 'phone')) {
            $definition .= "            '{$field}' => \$this->faker->phoneNumber(),\n";
        } elseif (str_contains($field, 'url') || str_contains($field, 'image') || str_contains($field, 'photo')) {
            $definition .= "            '{$field}' => \$this->faker->optional()->url(),\n";
        } elseif (str_contains($field, 'date') || str_contains($field, 'at')) {
            $definition .= "            '{$field}' => \$this->faker->dateTime(),\n";
        } elseif (str_contains($field, 'name') || str_contains($field, 'title')) {
            $definition .= "            '{$field}' => \$this->faker->sentence(),\n";
        } elseif (str_contains($field, 'description') || str_contains($field, 'content') || str_contains($field, 'body')) {
            $definition .= "            '{$field}' => \$this->faker->paragraph(),\n";
        } elseif (str_contains($field, 'price') || str_contains($field, 'amount') || str_contains($field, 'cost')) {
            $definition .= "            '{$field}' => \$this->faker->randomFloat(2, 0, 1000),\n";
        } elseif (str_contains($field, 'count') || str_contains($field, 'quantity')) {
            $definition .= "            '{$field}' => \$this->faker->numberBetween(0, 100),\n";
        } elseif (str_contains($field, 'is_') || str_contains($field, 'has_')) {
            $definition .= "            '{$field}' => \$this->faker->boolean(),\n";
        } elseif (str_contains($field, 'status')) {
            $definition .= "            '{$field}' => \$this->faker->randomElement(['active', 'inactive', 'pending']),\n";
        } elseif (str_contains($field, 'type')) {
            $definition .= "            '{$field}' => \$this->faker->word(),\n";
        } elseif (str_contains($field, 'slug')) {
            $definition .= "            '{$field}' => \$this->faker->slug(),\n";
        } else {
            $definition .= "            '{$field}' => \$this->faker->word(),\n";
        }
    }
    
    $definition .= "        ];\n    }";
    
    // Replace empty definition
    $oldPattern = '/public function definition\(\): array\s*\{[^}]*return\s*\[[^\]]*\];\s*\}/s';
    $newContent = preg_replace($oldPattern, $definition, $content);
    
    if ($newContent !== $content) {
        file_put_contents($factoryFile, $newContent);
        echo "✅ Fixed: {$factoryName}Factory\n";
        $fixed++;
    } else {
        $skipped++;
    }
}

echo "\n✅ Fixed: {$fixed} factories\n";
echo "⏭️  Skipped: {$skipped} factories (already complete or no fillable fields)\n";


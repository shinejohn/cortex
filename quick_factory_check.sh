#!/bin/bash
# Quick Factory Diagnostic
# Run from Laravel project root: bash quick_factory_check.sh

echo "=========================================="
echo "QUICK FACTORY DIAGNOSTIC"
echo "=========================================="

# Count models
MODEL_COUNT=$(find app/Models -name "*.php" 2>/dev/null | wc -l)
echo "Models found: $MODEL_COUNT"

# Count factories
FACTORY_COUNT=$(find database/factories -name "*Factory.php" 2>/dev/null | wc -l)
echo "Factories found: $FACTORY_COUNT"

echo ""
echo "=========================================="
echo "MODELS WITHOUT FACTORIES"
echo "=========================================="

# List models without factories
for model in app/Models/*.php; do
    model_name=$(basename "$model" .php)
    factory_file="database/factories/${model_name}Factory.php"
    if [ ! -f "$factory_file" ]; then
        echo "  ✗ $model_name - MISSING FACTORY"
    fi
done

echo ""
echo "=========================================="
echo "TESTING EACH FACTORY"
echo "=========================================="

# Test each factory
php artisan tinker --execute="
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

\$results = ['working' => [], 'broken' => []];

foreach (File::glob(database_path('factories/*.php')) as \$file) {
    \$factoryName = basename(\$file, '.php');
    \$modelName = str_replace('Factory', '', \$factoryName);
    \$modelClass = 'App\\\\Models\\\\' . \$modelName;
    
    if (!class_exists(\$modelClass)) {
        echo \"⚠ \$modelName - Model not found\\n\";
        continue;
    }
    
    try {
        DB::beginTransaction();
        \$modelClass::factory()->create();
        DB::rollBack();
        echo \"✓ \$modelName\\n\";
        \$results['working'][] = \$modelName;
    } catch (\\Throwable \$e) {
        DB::rollBack();
        \$error = substr(\$e->getMessage(), 0, 80);
        echo \"✗ \$modelName: \$error\\n\";
        \$results['broken'][] = \$modelName;
    }
}

echo \"\\n==========================================\\n\";
echo 'SUMMARY: ' . count(\$results['working']) . ' working, ' . count(\$results['broken']) . ' broken';
echo \"\\n==========================================\\n\";

if (!empty(\$results['broken'])) {
    echo \"\\nBROKEN FACTORIES TO FIX:\\n\";
    foreach (\$results['broken'] as \$i => \$m) {
        echo (\$i + 1) . \". \$m\\n\";
    }
}
"

echo ""
echo "=========================================="
echo "NEXT STEPS"
echo "=========================================="
echo "1. Run: php diagnose_factories.php > factory_report.txt"
echo "2. Copy the generated prompt to Cursor/Claude"
echo "3. Have it fix all factories in the specified order"
echo ""


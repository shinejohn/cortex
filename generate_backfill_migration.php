<?php

use Illuminate\Support\Str;

$dbFile = 'storage/app/audit/dictionary_database.json';
$migFile = 'storage/app/audit/dictionary_migrations.json';
$outputFile = 'database/migrations/2026_01_22_120000_backfill_missing_tables.php';

if (!file_exists($dbFile)) {
    die("DB Dictionary not found");
}
$db = json_decode(file_get_contents($dbFile), true);
$mig = json_decode(file_get_contents($migFile), true);

$missingTables = array_diff(array_keys($db), array_keys($mig));
$tablesToIgnore = ['migrations', 'sqlite_sequence'];

$upMethods = "";
$downMethods = "";

foreach ($missingTables as $tableName) {
    if (in_array($tableName, $tablesToIgnore))
        continue;

    $columns = $db[$tableName]['columns'];

    $schema = "        if (!Schema::hasTable('$tableName')) {\n";
    $schema .= "            Schema::create('$tableName', function (Blueprint \$table) {\n";

    // Track timestamps to create them at the end if strict structure needed, 
    // usually strict order matters but for backfill standard timestamps() is fine.
    $hasTimestamps = false;
    $hasSoftDeletes = false;

    foreach ($columns as $colDef) {
        $colName = $colDef['name'];
        $type = $colDef['type_name'];

        // Skip timestamp columns which are handled by ->timestamps() helper usually
        if ($colName === 'created_at' || $colName === 'updated_at') {
            $hasTimestamps = true; // We assume if one exists, we use the pair
            continue;
        }
        if ($colName === 'deleted_at') {
            $hasSoftDeletes = true;
            continue;
        }

        $laravelType = mapTypeToLaravel($type, $colName);
        $nullable = $colDef['nullable'] ? '->nullable()' : '';

        // Fix Default Value
        // In JSON it might be "'0'" or "NULL" or "current_timestamp()"
        $defaultVal = $colDef['default'];
        $defaultStr = '';

        if ($defaultVal !== null && $defaultVal !== 'NULL') {
            // Remove surrounding single quotes if present
            if (str_starts_with($defaultVal, "'") && str_ends_with($defaultVal, "'")) {
                $defaultVal = substr($defaultVal, 1, -1);
            }

            if ($defaultVal === 'CURRENT_TIMESTAMP') {
                $defaultStr = "->useCurrent()";
            } else {
                $defaultStr = "->default('$defaultVal')";
            }
        }

        // Special case for ID
        if ($colName === 'id' && ($colDef['primary'] ?? ($colDef['key'] == 'PRI' ?? false))) {
            // In the dictionary "primary" key might be in indexes, not columns directly in some versions?
            // Let's rely on name 'id' and type.
            if ($type === 'integer' || $type === 'bigint') {
                $schema .= "                \$table->id();\n";
                continue;
            }
            if ($type === 'varchar' || $type === 'char') {
                $schema .= "                \$table->uuid('id')->primary();\n";
                continue;
            }
        }

        $schema .= "                \$table->$laravelType('$colName')$nullable$defaultStr;\n";
    }

    if ($hasTimestamps) {
        $schema .= "                \$table->timestamps();\n";
    }
    if ($hasSoftDeletes) {
        $schema .= "                \$table->softDeletes();\n";
    }

    $schema .= "            });\n";
    $schema .= "        }\n\n";

    $upMethods .= $schema;
    $downMethods .= "        Schema::dropIfExists('$tableName');\n";
}

$migrationTemplate = <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
$upMethods
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
$downMethods
    }
};
PHP;

file_put_contents($outputFile, $migrationTemplate);
echo "Generated $outputFile\n";


function mapTypeToLaravel($type, $colName)
{
    if ($colName === 'id')
        return 'id'; // Placeholder

    if (str_contains($type, 'int'))
        return 'integer';
    if (str_contains($type, 'boolean') || str_contains($type, 'tinyint'))
        return 'boolean';
    if (str_contains($type, 'char') || str_contains($type, 'string'))
        return 'string';
    if (str_contains($type, 'text') || str_contains($type, 'blob'))
        return 'text';
    if (str_contains($type, 'date'))
        return 'date';
    if (str_contains($type, 'time'))
        return 'datetime';
    if (str_contains($type, 'decimal') || str_contains($type, 'float') || str_contains($type, 'double'))
        return 'decimal';
    if (str_contains($type, 'json'))
        return 'json';

    return 'string'; // Fallback
}
?>
<?php

$dbFile = 'storage/app/audit/dictionary_database.json';
$migFile = 'storage/app/audit/dictionary_migrations.json';

if (!file_exists($dbFile) || !file_exists($migFile)) {
    die("Dictionaries not found.\n");
}

$db = json_decode(file_get_contents($dbFile), true);
$mig = json_decode(file_get_contents($migFile), true);

$dbTables = array_keys($db);
$migTables = array_keys($mig);

$missing = array_diff($dbTables, $migTables);

echo "Total DB Tables: " . count($dbTables) . "\n";
echo "Total Migrations: " . count($migTables) . "\n";
echo "Missing Migrations for: " . count($missing) . " tables.\n\n";

foreach ($missing as $table) {
    echo $table . "\n";
}

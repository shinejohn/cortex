<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
foreach ($tables as $table) {
    try {
        $count = DB::table($table->table_name)->count();
        echo "{$table->table_name}: {$count}\n";
    } catch (\Exception $e) {
        echo "{$table->table_name}: ERROR (" . $e->getMessage() . ")\n";
    }
}

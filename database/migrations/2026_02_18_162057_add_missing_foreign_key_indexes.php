<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds indexes to foreign key columns that are missing them (performance).
     * Runs on default connection; supports multi-database if configured.
     */
    public function up(): void
    {
        $connections = [config('database.default')];
        foreach (['publishing', 'command_center', 'ai_tools', 'pros_bros'] as $name) {
            if (config("database.connections.{$name}") !== null) {
                $connections[] = $name;
            }
        }
        $connections = array_unique($connections);

        foreach ($connections as $conn) {
            try {
                $this->addMissingIndexesForConnection($conn);
            } catch (Throwable $e) {
                if ($conn !== config('database.default')) {
                    continue;
                }
                throw $e;
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Index removal is optional - indexes don't affect correctness
    }

    private function addMissingIndexesForConnection(string $connection): void
    {
        $driver = DB::connection($connection)->getDriverName();
        if ($driver !== 'pgsql') {
            return;
        }

        $tables = DB::connection($connection)
            ->select("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
        $added = 0;

        foreach ($tables as $tableRow) {
            $table = $tableRow->tablename;
            $columns = DB::connection($connection)
                ->select("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name LIKE '%_id'", [$table]);

            foreach ($columns as $colRow) {
                $column = $colRow->column_name;
                $exists = DB::connection($connection)
                    ->selectOne("SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = ? AND indexdef LIKE ?", [$table, "%({$column})%"]);
                if (! $exists) {
                    try {
                        Schema::connection($connection)->table($table, function (Blueprint $t) use ($column) {
                            $t->index($column);
                        });
                        $added++;
                    } catch (Throwable $e) {
                        // Index may already exist with different name, skip
                    }
                }
            }
        }
    }
};

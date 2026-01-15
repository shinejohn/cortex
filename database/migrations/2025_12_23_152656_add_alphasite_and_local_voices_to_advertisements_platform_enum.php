<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();
        
        if ($driver === 'pgsql') {
            // For PostgreSQL, Laravel's enum() creates a CHECK constraint, not a PostgreSQL enum type
            // We need to find and drop the existing constraint, then recreate it with additional values
            $constraints = DB::select("
                SELECT conname 
                FROM pg_constraint 
                WHERE conrelid = 'advertisements'::regclass 
                AND contype = 'c'
            ");
            
            // Drop all CHECK constraints on the table (Laravel typically creates one for enum columns)
            foreach ($constraints as $constraint) {
                $constraintName = $constraint->conname;
                // Check if this constraint is related to the platform column
                $checkDef = DB::selectOne("
                    SELECT pg_get_constraintdef(oid) as definition
                    FROM pg_constraint 
                    WHERE conname = ?
                ", [$constraintName]);
                
                if ($checkDef && str_contains($checkDef->definition, 'platform')) {
                    DB::statement("ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS {$constraintName}");
                }
            }
            
            // Recreate the constraint with all values including the new ones
            DB::statement("ALTER TABLE advertisements ADD CONSTRAINT advertisements_platform_check CHECK (platform IN (
                'day_news', 'event_city', 'downtown_guide', 'alphasite', 'local_voices'
            ))");
        } else {
            // For MySQL/SQLite, we need to recreate the column
            // SQLite doesn't support ALTER TABLE DROP COLUMN easily, skip for testing
            if (DB::connection()->getDriverName() === 'sqlite') {
                // For SQLite in testing, the enum values are already correct in the original migration
                // This migration can be skipped
                return;
            }
            
            Schema::table('advertisements', function (Blueprint $table) {
                $table->dropColumn('platform');
            });
            
            Schema::table('advertisements', function (Blueprint $table) {
                $table->enum('platform', ['day_news', 'event_city', 'downtown_guide', 'alphasite', 'local_voices'])->after('id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        
        if ($driver === 'pgsql') {
            // For PostgreSQL, Laravel's enum() creates a CHECK constraint, not a PostgreSQL enum type
            // We need to find and drop the existing constraint, then recreate it without the new values
            $constraints = DB::select("
                SELECT conname 
                FROM pg_constraint 
                WHERE conrelid = 'advertisements'::regclass 
                AND contype = 'c'
            ");
            
            // Drop all CHECK constraints on the table
            foreach ($constraints as $constraint) {
                $constraintName = $constraint->conname;
                // Check if this constraint is related to the platform column
                $checkDef = DB::selectOne("
                    SELECT pg_get_constraintdef(oid) as definition
                    FROM pg_constraint 
                    WHERE conname = ?
                ", [$constraintName]);
                
                if ($checkDef && str_contains($checkDef->definition, 'platform')) {
                    DB::statement("ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS {$constraintName}");
                }
            }
            
            // Recreate the constraint without the new values
            DB::statement("ALTER TABLE advertisements ADD CONSTRAINT advertisements_platform_check CHECK (platform IN (
                'day_news', 'event_city', 'downtown_guide'
            ))");
        } else {
            // For MySQL/SQLite
            Schema::table('advertisements', function (Blueprint $table) {
                $table->dropColumn('platform');
            });
            
            Schema::table('advertisements', function (Blueprint $table) {
                $table->enum('platform', ['day_news', 'event_city', 'downtown_guide'])->after('id');
            });
        }
    }
};

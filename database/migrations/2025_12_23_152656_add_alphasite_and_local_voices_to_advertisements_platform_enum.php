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
        // For PostgreSQL, we need to alter the enum type
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TYPE advertisements_platform_enum ADD VALUE IF NOT EXISTS 'alphasite'");
            DB::statement("ALTER TYPE advertisements_platform_enum ADD VALUE IF NOT EXISTS 'local_voices'");
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
        // For PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            // PostgreSQL doesn't support removing enum values easily
            // We'll need to recreate the column
            Schema::table('advertisements', function (Blueprint $table) {
                $table->dropColumn('platform');
            });
            
            DB::statement("CREATE TYPE advertisements_platform_enum_old AS ENUM ('day_news', 'event_city', 'downtown_guide')");
            
            Schema::table('advertisements', function (Blueprint $table) {
                $table->addColumn('platform', 'advertisements_platform_enum_old')->after('id');
            });
            
            DB::statement("DROP TYPE IF EXISTS advertisements_platform_enum");
            DB::statement("ALTER TYPE advertisements_platform_enum_old RENAME TO advertisements_platform_enum");
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

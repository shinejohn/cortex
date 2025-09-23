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
        // Clear any existing data since we can't convert bigint to uuid
        DB::table('social_activities')->truncate();

        // Drop the existing index first
        DB::statement('DROP INDEX IF EXISTS social_activities_subject_type_subject_id_index');

        // Change the column type using raw SQL to handle PostgreSQL specific conversion
        DB::statement('ALTER TABLE social_activities ALTER COLUMN subject_id TYPE uuid USING NULL::uuid');

        // Recreate the index
        DB::statement('CREATE INDEX social_activities_subject_type_subject_id_index ON social_activities(subject_type, subject_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('social_activities', function (Blueprint $table) {
            // Drop the index
            $table->dropIndex(['subject_type', 'subject_id']);

            // Change back to bigint
            $table->bigInteger('subject_id')->change();

            // Recreate the index
            $table->index(['subject_type', 'subject_id']);
        });
    }
};

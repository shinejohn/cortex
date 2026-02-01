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
        if (\Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
            return;
        }

        // First drop any existing check constraint.
        // Laravel usually names it {table}_{column}_check
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_type_check');
        
        // Change the type to varchar
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE announcements ALTER COLUMN type TYPE VARCHAR(255)');
        
        // Add the new check constraint
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE announcements ADD CONSTRAINT announcements_type_check CHECK (type IN ('wedding', 'engagement', 'birth', 'graduation', 'anniversary', 'celebration', 'general', 'community_event', 'public_notice', 'emergency_alert', 'meeting', 'volunteer_opportunity', 'road_closure', 'school_announcement', 'memorial', 'obituary'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (\Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
            return;
        }

        \Illuminate\Support\Facades\DB::statement('ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_type_check');
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE announcements ALTER COLUMN type TYPE VARCHAR(255)');
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE announcements ADD CONSTRAINT announcements_type_check CHECK (type IN ('wedding', 'engagement', 'birth', 'graduation', 'anniversary', 'celebration', 'general', 'community_event', 'public_notice', 'emergency_alert', 'meeting', 'volunteer_opportunity', 'road_closure', 'school_announcement'))");
    }
};

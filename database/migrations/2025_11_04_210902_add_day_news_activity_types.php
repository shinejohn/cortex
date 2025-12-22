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
     */
    public function up(): void
    {
        // Note: MySQL doesn't support ALTER ENUM directly, so we need to modify the column
        // This migration adds Day News activity types to the existing enum
        
        $driver = DB::getDriverName();
        
        if ($driver === 'mysql') {
            // For MySQL, we need to alter the column type
            DB::statement("ALTER TABLE social_activities MODIFY COLUMN type ENUM(
                'post_like', 'post_comment', 'post_share',
                'friend_request', 'friend_accept',
                'group_invite', 'group_join', 'group_post',
                'profile_follow',
                'article_like', 'article_comment', 'article_share', 'article_view',
                'tag_follow', 'author_follow'
            ) NOT NULL");
        } elseif ($driver === 'pgsql') {
            // For PostgreSQL, we can use ALTER TYPE
            DB::statement("ALTER TYPE social_activities_type_enum ADD VALUE IF NOT EXISTS 'article_like'");
            DB::statement("ALTER TYPE social_activities_type_enum ADD VALUE IF NOT EXISTS 'article_comment'");
            DB::statement("ALTER TYPE social_activities_type_enum ADD VALUE IF NOT EXISTS 'article_share'");
            DB::statement("ALTER TYPE social_activities_type_enum ADD VALUE IF NOT EXISTS 'article_view'");
            DB::statement("ALTER TYPE social_activities_type_enum ADD VALUE IF NOT EXISTS 'tag_follow'");
            DB::statement("ALTER TYPE social_activities_type_enum ADD VALUE IF NOT EXISTS 'author_follow'");
        } elseif ($driver === 'sqlite') {
            // SQLite stores ENUMs as strings, so new values will work without modification
            // No action needed - the application will validate the enum values
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: Removing enum values is complex and may not be fully reversible
        // In practice, you may need to recreate the table or leave the values
        // This is a common limitation with ENUM types
    }
};


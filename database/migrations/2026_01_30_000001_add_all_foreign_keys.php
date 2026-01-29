<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add all foreign key constraints AFTER all tables have been created.
 * 
 * This migration runs last and safely adds FK constraints using defensive patterns:
 * - Schema::hasTable() checks
 * - Schema::hasColumn() checks  
 * - try-catch to ignore "already exists" errors
 * 
 * Pattern inspired by working taskjuggler platform.
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // article_comments foreign keys
        $this->addForeignKey('article_comments', 'user_id', 'users', 'id', 'cascade');
        $this->addForeignKey('article_comments', 'parent_id', 'article_comments', 'id', 'cascade');
        
        // article_comment_likes foreign keys
        $this->addForeignKey('article_comment_likes', 'comment_id', 'article_comments', 'id', 'cascade');
        $this->addForeignKey('article_comment_likes', 'user_id', 'users', 'id', 'cascade');
        
        // Add more FK constraints here as needed for other tables
        // Example pattern:
        // $this->addForeignKey('source_table', 'column_name', 'target_table', 'target_column', 'cascade');
    }

    /**
     * Safely add a foreign key constraint with full existence checks.
     */
    private function addForeignKey(
        string $sourceTable, 
        string $sourceColumn, 
        string $targetTable, 
        string $targetColumn = 'id',
        string $onDelete = 'cascade'
    ): void {
        // Check both tables exist
        if (!Schema::hasTable($sourceTable) || !Schema::hasTable($targetTable)) {
            return;
        }
        
        // Check source column exists
        if (!Schema::hasColumn($sourceTable, $sourceColumn)) {
            return;
        }
        
        // Check target column exists
        if (!Schema::hasColumn($targetTable, $targetColumn)) {
            return;
        }
        
        try {
            Schema::table($sourceTable, function (Blueprint $table) use ($sourceColumn, $targetTable, $targetColumn, $onDelete) {
                $table->foreign($sourceColumn)
                    ->references($targetColumn)
                    ->on($targetTable)
                    ->onDelete($onDelete);
            });
        } catch (\Exception $e) {
            // Ignore "already exists" or "duplicate" errors
            $message = strtolower($e->getMessage());
            if (strpos($message, 'already exists') === false && 
                strpos($message, 'duplicate') === false &&
                strpos($message, 'relation') === false) {
                throw $e;
            }
            // FK already exists, that's fine
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop FKs in reverse order (safest approach)
        $this->dropForeignKeyIfExists('article_comment_likes', 'article_comment_likes_user_id_foreign');
        $this->dropForeignKeyIfExists('article_comment_likes', 'article_comment_likes_comment_id_foreign');
        $this->dropForeignKeyIfExists('article_comments', 'article_comments_parent_id_foreign');
        $this->dropForeignKeyIfExists('article_comments', 'article_comments_user_id_foreign');
    }
    
    /**
     * Safely drop a foreign key if it exists.
     */
    private function dropForeignKeyIfExists(string $table, string $foreignKeyName): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }
        
        try {
            Schema::table($table, function (Blueprint $table) use ($foreignKeyName) {
                $table->dropForeign($foreignKeyName);
            });
        } catch (\Exception $e) {
            // Ignore if FK doesn't exist
        }
    }
};

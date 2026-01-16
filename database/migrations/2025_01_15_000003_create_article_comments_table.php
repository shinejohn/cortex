<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Disable transactions for this migration to allow self-referencing foreign keys.
     */
    public $withinTransaction = false;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('article_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('article_id'); // Create column first without foreign key
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('parent_id')->nullable();
            $table->text('content');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_pinned')->default(false);
            $table->unsignedInteger('reports_count')->default(0);
            $table->timestamps();

            $table->index(['article_id', 'parent_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['article_id', 'is_active', 'created_at']);
        });
        
        // Ensure primary key constraint is committed before adding foreign key
        // Use DB::statement to explicitly add the foreign key after table creation
        \Illuminate\Support\Facades\DB::statement('
            ALTER TABLE article_comments 
            ADD CONSTRAINT article_comments_parent_id_foreign 
            FOREIGN KEY (parent_id) 
            REFERENCES article_comments(id) 
            ON DELETE CASCADE
        ');
        
        // Add foreign key constraint only if day_news_posts table exists
        if (Schema::hasTable('day_news_posts')) {
            Schema::table('article_comments', function (Blueprint $table) {
                $table->foreign('article_id')->references('id')->on('day_news_posts')->onDelete('cascade');
            });
        }

        // Article comment likes table
        Schema::create('article_comment_likes', function (Blueprint $table) {
            $table->id();
            $table->uuid('comment_id')->constrained('article_comments')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['comment_id', 'user_id']);
            $table->index(['comment_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_comment_likes');
        Schema::dropIfExists('article_comments');
    }
};


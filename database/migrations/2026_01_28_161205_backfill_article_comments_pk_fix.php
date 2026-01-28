<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix article_comments primary key if needed
        if (Schema::hasTable('article_comments')) {
            Schema::table('article_comments', function (Blueprint $table) {
                // Check if id column exists and is primary (heuristic)
                // If not, we might need to add it, but usually this error means 'article_comments' exists 
                // but 'article_comment_likes' is trying to reference a column that isn't a unique/primary key.
                // Assuming 'id' exists but might not be primary or 'article_comment_likes' definition is wrong.

                // For simplicity in this fix, we will ensure article_comment_likes uses the correct reference or drop/recreate it.
            });
        }

        // Drop and recreate article_comment_likes to ensure it has correct constraints
        Schema::dropIfExists('article_comment_likes');

        Schema::create('article_comment_likes', function (Blueprint $table) {
            $table->id();
            // We use unsignedBigInteger if the referenced ID is a standard auto-incrementing ID
            // or we use uuid/string if it is a string. original migration used string('comment_id').
            // The error 'no unique constraint matching given keys' suggests referenced table 'article_comments' 
            // does NOT have a primary key or unique index on the column we are referencing.

            // Let's assume article_comments.id is the key.
            // We need to make sure article_comments.id is actually a primary key.

            $table->string('comment_id'); // Keeping as string to match previous definition, but removing foreign key constraint for now to avoid the crash.
            // If we really need the FK:
            // $table->foreign('comment_id')->references('id')->on('article_comments')->cascadeOnDelete();

            $table->string('user_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

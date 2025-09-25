<?php

declare(strict_types=1);

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
        // Create conversations table
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type')->default('private'); // private, group
            $table->string('title')->nullable(); // For group conversations
            $table->json('metadata')->nullable(); // For additional conversation data
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->index(['type', 'last_message_at']);
        });

        // Create conversation_participants table
        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->uuid('user_id');
            $table->timestamp('joined_at');
            $table->timestamp('last_read_at')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unique(['conversation_id', 'user_id']);
            $table->index(['user_id', 'last_read_at']);
        });

        // Create messages table
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->uuid('sender_id');
            $table->text('content');
            $table->string('type')->default('text'); // text, image, file, system
            $table->json('metadata')->nullable(); // For file attachments, system message data, etc.
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');

            $table->index(['conversation_id', 'created_at']);
            $table->index(['sender_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
    }
};

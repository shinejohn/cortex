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
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            $table->uuid('customer_id')->nullable();
            $table->string('channel', 50)->default('alphasite_chat');
            $table->string('status', 50)->default('active');
            $table->json('messages')->nullable();
            $table->integer('message_count')->default(0);
            $table->string('resolved_by', 50)->nullable();
            $table->text('summary')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('business_id');
            $table->index('customer_id');
            $table->index(['business_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
    }
};

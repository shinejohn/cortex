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
        Schema::create('notification_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // What was sent
            $table->string('platform', 50)->index();
            $table->string('community_id', 100)->nullable()->index();
            $table->string('notification_type', 50)->index();
            $table->enum('channel', ['sms', 'web_push', 'app_push', 'email'])->index();
            
            // Content
            $table->string('title', 255)->nullable();
            $table->text('message');
            $table->json('payload')->nullable();
            
            // Delivery info
            $table->integer('recipient_count')->default(0);
            $table->string('sns_message_id', 255)->nullable();
            
            // Status
            $table->enum('status', ['queued', 'sent', 'failed', 'partial'])->default('queued')->index();
            $table->text('error_message')->nullable();
            
            // Timing
            $table->timestamps();
            $table->timestamp('sent_at')->nullable();
            
            // Composite indexes for reporting
            $table->index(['platform', 'created_at'], 'idx_platform_date');
            $table->index(['community_id', 'created_at'], 'idx_community_date');
            $table->index(['status', 'created_at'], 'idx_status_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_log');
    }
};

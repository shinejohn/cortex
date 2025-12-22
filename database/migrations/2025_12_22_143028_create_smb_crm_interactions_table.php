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
        Schema::create('smb_crm_interactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            $table->uuid('customer_id')->nullable();
            
            // Interaction Details
            $table->string('interaction_type', 50); // ai_chat, phone, email, in_person, booking, order
            $table->string('channel', 50)->nullable();
            $table->string('direction', 20)->nullable(); // inbound, outbound
            
            // Content
            $table->string('subject', 500)->nullable();
            $table->text('content')->nullable();
            $table->text('summary')->nullable();
            
            // AI Handling
            $table->string('handled_by', 50)->nullable(); // ai, human, ai_escalated
            $table->string('ai_service_used', 100)->nullable();
            $table->decimal('ai_confidence_score', 5, 4)->nullable();
            $table->text('escalated_reason')->nullable();
            
            // Outcome
            $table->string('outcome', 100)->nullable();
            $table->string('sentiment', 50)->nullable();
            
            // Metadata
            $table->integer('duration_seconds')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('customer_id')->references('id')->on('smb_crm_customers')->nullOnDelete();
            
            $table->index('business_id');
            $table->index('customer_id');
            $table->index('interaction_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smb_crm_interactions');
    }
};

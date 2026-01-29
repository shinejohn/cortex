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
        Schema::create('smb_crm_customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            
            // Customer Information
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            
            // Source
            $table->string('source', 100)->nullable();
            $table->json('source_details')->nullable();
            
            // Status
            $table->string('status', 50)->default('lead'); // lead, prospect, customer, inactive, churned
            $table->date('customer_since')->nullable();
            $table->timestamp('last_interaction_at')->nullable();
            
            // AI-Generated Insights
            $table->integer('health_score')->nullable();
            $table->decimal('lifetime_value', 10, 2)->nullable();
            $table->decimal('predicted_churn_risk', 5, 4)->nullable();
            $table->text('ai_notes')->nullable();
            
            // Preferences (from surveys/interactions)
            $table->json('preferences')->nullable();
            $table->json('tags')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
// FK DISABLED
            
            $table->index('business_id');
            $table->index(['business_id', 'email']);
            $table->index(['business_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smb_crm_customers');
    }
};

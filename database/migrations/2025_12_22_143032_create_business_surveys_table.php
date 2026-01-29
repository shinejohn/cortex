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
        Schema::create('business_surveys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            
            // Survey Definition
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('survey_type', 50)->nullable();
            
            // Questions (JSON array)
            $table->json('questions');
            
            // Triggers
            $table->string('trigger_type', 50)->nullable();
            $table->json('trigger_config')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('responses_count')->default(0);
            $table->decimal('average_score', 3, 2)->nullable();
            
            $table->timestamps();
            
// FK DISABLED
            
            $table->index('business_id');
        });
        
        Schema::create('business_survey_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('survey_id');
            $table->uuid('business_id');
            $table->uuid('customer_id')->nullable();
            
            // Response Data
            $table->json('responses');
            $table->decimal('overall_score', 3, 2)->nullable();
            
            // AI Analysis
            $table->string('sentiment', 50)->nullable();
            $table->text('ai_summary')->nullable();
            $table->json('action_items')->nullable();
            
            // Metadata
            $table->timestamp('completed_at')->useCurrent();
            $table->string('source', 50)->nullable();
            
            $table->timestamps();
            
// FK DISABLED
// FK DISABLED
// FK DISABLED
            
            $table->index('survey_id');
            $table->index('business_id');
            $table->index('customer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_survey_responses');
        Schema::dropIfExists('business_surveys');
    }
};

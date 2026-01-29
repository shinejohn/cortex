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
        Schema::create('business_faqs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            
            // FAQ Content
            $table->text('question');
            $table->text('answer');
            
            // Categorization
            $table->string('category', 100)->nullable();
            $table->json('tags')->nullable();
            
            // AI Training
            $table->json('variations')->nullable();
            $table->json('follow_up_questions')->nullable();
            
            // Usage Tracking
            $table->integer('times_used')->default(0);
            $table->integer('helpful_votes')->default(0);
            $table->integer('unhelpful_votes')->default(0);
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            
            $table->timestamps();
            
$1// FK DISABLED: $2
            
            $table->index('business_id');
            $table->index(['business_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_faqs');
    }
};

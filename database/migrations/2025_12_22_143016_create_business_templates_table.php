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
        Schema::create('business_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->uuid('industry_id')->nullable();
            
            // Template Configuration
            $table->json('layout_config')->nullable();
            $table->json('available_tabs')->nullable();
            $table->json('default_tabs')->nullable();
            $table->json('ai_features')->nullable();
            
            // Styling
            $table->json('theme_config')->nullable();
            $table->json('component_overrides')->nullable();
            
            // SEO Template
            $table->json('seo_template')->nullable();
            $table->json('schema_template')->nullable();
            
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
$1// FK DISABLED: $2
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_templates');
    }
};

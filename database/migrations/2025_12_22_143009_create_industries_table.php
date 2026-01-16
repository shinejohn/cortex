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
        Schema::create('industries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon', 100)->nullable();
            $table->uuid('parent_id')->nullable();
            
            // Template Configuration
            $table->uuid('default_template_id')->nullable();
            $table->json('available_features')->nullable();
            $table->json('required_fields')->nullable();
            
            // SEO
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('schema_type', 100)->nullable(); // LocalBusiness, Restaurant, etc.
            
            // Display
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
        
        // Add self-referencing foreign key AFTER table is created
        // Use DB::unprepared to run outside transaction context
        \Illuminate\Support\Facades\DB::unprepared('
            ALTER TABLE industries 
            ADD CONSTRAINT industries_parent_id_foreign 
            FOREIGN KEY (parent_id) 
            REFERENCES industries(id) 
            ON DELETE SET NULL
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('industries');
    }
};

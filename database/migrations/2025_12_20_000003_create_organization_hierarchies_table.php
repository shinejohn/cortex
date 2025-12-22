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
        Schema::create('organization_hierarchies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Organization
            $table->uuid('organization_id');
            
            // Parent organization
            $table->uuid('parent_id')->nullable();
            
            // Hierarchy level (0 = root, 1 = first level child, etc.)
            $table->integer('level')->default(0);
            
            // Full path (e.g., "Rotary International > District 123 > Springfield Chapter")
            $table->string('path', 500)->nullable();
            
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('organization_id')
                ->references('id')
                ->on('businesses')
                ->cascadeOnDelete();
            
            $table->foreign('parent_id')
                ->references('id')
                ->on('businesses')
                ->nullOnDelete();
            
            // Unique constraint
            $table->unique(['organization_id', 'parent_id']);
            
            // Indexes
            $table->index('organization_id');
            $table->index('parent_id');
            $table->index('level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_hierarchies');
    }
};


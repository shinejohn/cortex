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
        Schema::create('organization_relationships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Organization (Business)
            $table->uuid('organization_id');
            
            // Polymorphic relationship to any content type
            $table->string('relatable_type'); // e.g., 'App\Models\DayNewsPost', 'App\Models\Event', etc.
            $table->uuid('relatable_id');
            
            // Relationship type
            $table->string('relationship_type')->default('related');
            // Values: 'related', 'sponsored', 'featured', 'partner', 'host', 'organizer', 'venue',
            // 'sponsor', 'author', 'source', 'subject'
            
            // Primary relationship flag
            $table->boolean('is_primary')->default(false);
            
            // Additional metadata
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign key
// FK DISABLED
            
            // Unique constraint: same organization can't have duplicate relationships
            $table->unique(['organization_id', 'relatable_type', 'relatable_id', 'relationship_type'], 'org_rel_unique');
            
            // Indexes
            $table->index(['relatable_type', 'relatable_id']);
            $table->index('relationship_type');
            $table->index('is_primary');
            $table->index('organization_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_relationships');
    }
};


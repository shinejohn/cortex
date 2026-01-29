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
        Schema::table('businesses', function (Blueprint $table) {
            // Organization type and level
            $table->string('organization_type')->default('business')->after('status');
            // Values: 'business', 'government', 'non_profit', 'religious', 'educational', 'healthcare', 'other'
            
            $table->string('organization_level')->default('local')->after('organization_type');
            // Values: 'local', 'regional', 'state', 'national', 'international'
            
            // Organization hierarchy
            $table->uuid('parent_organization_id')->nullable()->after('organization_level');
            
            // Organization category (specific type)
            $table->string('organization_category')->nullable()->after('parent_organization_id');
            // Values: 'city_government', 'county_government', 'state_government', 'federal_government',
            // 'law_enforcement', 'fire_department', 'school_district', etc.
            
            // Organization flag
            $table->boolean('is_organization')->default(false)->after('organization_category');
            
            // Organization identifier (FIPS code, EIN, etc.)
            $table->string('organization_identifier')->nullable()->after('is_organization');
            
            // Organization hierarchy path (JSON)
            $table->json('organization_hierarchy')->nullable()->after('organization_identifier');
            
            // Foreign key for parent organization
// FK DISABLED
            
            // Indexes
            $table->index('organization_type');
            $table->index('organization_level');
            $table->index('parent_organization_id');
            $table->index('is_organization');
            $table->index('organization_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropForeign(['parent_organization_id']);
            $table->dropIndex(['organization_type']);
            $table->dropIndex(['organization_level']);
            $table->dropIndex(['parent_organization_id']);
            $table->dropIndex(['is_organization']);
            $table->dropIndex(['organization_category']);
            
            $table->dropColumn([
                'organization_type',
                'organization_level',
                'parent_organization_id',
                'organization_category',
                'is_organization',
                'organization_identifier',
                'organization_hierarchy',
            ]);
        });
    }
};


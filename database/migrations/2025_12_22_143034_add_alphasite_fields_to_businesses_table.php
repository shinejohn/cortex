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
        Schema::table('businesses', function (Blueprint $table) {
            // AlphaSite-Specific Fields
            $table->string('alphasite_subdomain', 255)->unique()->nullable()->after('slug');
            $table->uuid('template_id')->nullable()->after('alphasite_subdomain');
            $table->boolean('ai_services_enabled')->default(false)->after('template_id');
            $table->timestamp('premium_enrolled_at')->nullable()->after('ai_services_enabled');
            $table->timestamp('premium_expires_at')->nullable()->after('premium_enrolled_at');
            $table->string('subscription_tier', 50)->default('free')->after('premium_expires_at');
            $table->json('homepage_content')->nullable()->after('subscription_tier');
            $table->json('social_links')->nullable()->after('homepage_content');
            $table->json('amenities')->nullable()->after('social_links');
            $table->boolean('featured')->default(false)->after('amenities');
            $table->boolean('promoted')->default(false)->after('featured');
            $table->json('seo_metadata')->nullable()->after('promoted');
            $table->uuid('industry_id')->nullable()->after('seo_metadata');
            
            // Foreign keys
$1// FK DISABLED: $2
$1// FK DISABLED: $2
            
            // Indexes
            $table->index('alphasite_subdomain');
            $table->index('industry_id');
            $table->index('template_id');
            $table->index('subscription_tier');
            $table->index('featured');
            $table->index(['city', 'state']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropForeign(['template_id']);
            $table->dropForeign(['industry_id']);
            $table->dropIndex(['alphasite_subdomain']);
            $table->dropIndex(['industry_id']);
            $table->dropIndex(['template_id']);
            $table->dropIndex(['subscription_tier']);
            $table->dropIndex(['featured']);
            $table->dropIndex(['city', 'state']);
            
            $table->dropColumn([
                'alphasite_subdomain',
                'template_id',
                'ai_services_enabled',
                'premium_enrolled_at',
                'premium_expires_at',
                'subscription_tier',
                'homepage_content',
                'social_links',
                'amenities',
                'featured',
                'promoted',
                'seo_metadata',
                'industry_id',
            ]);
        });
    }
};

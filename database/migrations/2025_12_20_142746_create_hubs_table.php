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
        Schema::create('hubs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('created_by');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('banner_image')->nullable();
            $table->text('about')->nullable();
            $table->string('category')->nullable();
            $table->string('subcategory')->nullable();
            $table->string('location')->nullable();
            $table->string('website')->nullable();
            $table->json('social_links')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->json('design_settings')->nullable();
            $table->json('monetization_settings')->nullable();
            $table->json('permissions')->nullable();
            $table->boolean('analytics_enabled')->default(true);
            $table->boolean('articles_enabled')->default(true);
            $table->boolean('community_enabled')->default(true);
            $table->boolean('events_enabled')->default(true);
            $table->boolean('gallery_enabled')->default(true);
            $table->boolean('performers_enabled')->default(true);
            $table->boolean('venues_enabled')->default(true);
            $table->integer('followers_count')->default(0);
            $table->integer('events_count')->default(0);
            $table->integer('articles_count')->default(0);
            $table->integer('members_count')->default(0);
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

// FK DISABLED
// FK DISABLED
            $table->index(['workspace_id', 'is_active']);
            $table->index(['slug']);
            $table->index(['is_featured', 'is_active']);
            $table->index(['published_at']);
        });

        Schema::create('hub_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('hub_id');
            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('content')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

// FK DISABLED
            $table->index(['hub_id', 'sort_order']);
            $table->index(['hub_id', 'is_visible']);
        });

        Schema::create('hub_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('hub_id');
            $table->uuid('user_id');
            $table->string('role')->default('member');
            $table->json('permissions')->nullable();
            $table->timestamp('joined_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

// FK DISABLED
// FK DISABLED
            $table->unique(['hub_id', 'user_id']);
            $table->index(['hub_id', 'role']);
            $table->index(['hub_id', 'is_active']);
        });

        Schema::create('hub_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('hub_id');
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->json('permissions')->nullable();
            $table->boolean('is_system')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

// FK DISABLED
            $table->unique(['hub_id', 'slug']);
            $table->index(['hub_id', 'sort_order']);
        });

        Schema::create('hub_analytics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('hub_id');
            $table->date('date');
            $table->integer('page_views')->default(0);
            $table->integer('unique_visitors')->default(0);
            $table->integer('events_created')->default(0);
            $table->integer('events_published')->default(0);
            $table->integer('articles_created')->default(0);
            $table->integer('articles_published')->default(0);
            $table->integer('members_joined')->default(0);
            $table->integer('followers_gained')->default(0);
            $table->decimal('engagement_score', 10, 2)->default(0);
            $table->decimal('revenue', 10, 2)->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

// FK DISABLED
            $table->unique(['hub_id', 'date']);
            $table->index(['hub_id', 'date']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->uuid('hub_id')->nullable()->after('workspace_id');
// FK DISABLED
            $table->index(['hub_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['hub_id']);
            $table->dropColumn('hub_id');
        });

        Schema::dropIfExists('hub_analytics');
        Schema::dropIfExists('hub_roles');
        Schema::dropIfExists('hub_members');
        Schema::dropIfExists('hub_sections');
        Schema::dropIfExists('hubs');
    }
};

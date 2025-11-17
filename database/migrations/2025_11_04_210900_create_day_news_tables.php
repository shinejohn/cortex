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
        // Day News Posts table
        Schema::create('day_news_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('workspace_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['article', 'announcement', 'notice', 'ad', 'schedule']);
            $table->enum('category', [
                'local_news',
                'business',
                'sports',
                'entertainment',
                'community',
                'education',
                'health',
                'politics',
                'crime',
                'weather',
                'events',
                'obituary',
                'missing_person',
                'emergency',
                'public_notice',
                'other',
            ])->nullable();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->text('excerpt')->nullable();
            $table->string('featured_image')->nullable();
            $table->json('metadata')->nullable();
            $table->enum('status', ['draft', 'published', 'expired', 'removed'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedBigInteger('view_count')->default(0);
            $table->timestamps();

            $table->index(['workspace_id', 'status']);
            $table->index(['type', 'status']);
            $table->index(['published_at', 'status']);
            $table->index('slug');
        });

        // Day News Post Payments table
        Schema::create('day_news_post_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('day_news_posts')->cascadeOnDelete();
            $table->foreignUuid('workspace_id')->constrained()->cascadeOnDelete();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_checkout_session_id')->nullable();
            $table->integer('amount');
            $table->string('currency', 3)->default('usd');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->enum('payment_type', ['post', 'ad']);
            $table->integer('ad_days')->nullable();
            $table->timestamps();

            $table->index('post_id');
            $table->index('workspace_id');
            $table->index('stripe_payment_intent_id');
            $table->index('stripe_checkout_session_id');
        });

        // Advertisements table (generic for all platforms)
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->enum('platform', ['day_news', 'event_city', 'downtown_guide']);
            $table->string('advertable_type');
            $table->string('advertable_id');
            $table->enum('placement', ['sidebar', 'banner', 'inline', 'featured'])->default('sidebar');
            $table->json('regions')->nullable();
            $table->unsignedBigInteger('impressions_count')->default(0);
            $table->unsignedBigInteger('clicks_count')->default(0);
            $table->timestamp('starts_at');
            $table->timestamp('expires_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['platform', 'is_active']);
            $table->index('expires_at');
            $table->index(['advertable_type', 'advertable_id']);
        });

        // Day News Post Region pivot table
        Schema::create('day_news_post_region', function (Blueprint $table) {
            $table->id();
            $table->foreignId('day_news_post_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('region_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['day_news_post_id', 'region_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('day_news_post_region');
        Schema::dropIfExists('advertisements');
        Schema::dropIfExists('day_news_post_payments');
        Schema::dropIfExists('day_news_posts');
    }
};

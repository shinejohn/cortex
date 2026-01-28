<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_sources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('community_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('source_type', 50);
            $table->string('subtype', 50)->nullable();
            $table->text('description')->nullable();
            $table->text('website_url')->nullable();
            $table->text('rss_url')->nullable();
            $table->foreignId('business_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_potential_customer')->default(true);
            $table->string('customer_status', 20)->default('prospect');
            $table->string('platform', 50)->nullable();
            $table->jsonb('platform_config')->nullable();
            $table->integer('default_poll_interval_minutes')->default(60);
            $table->string('default_processing_tier', 10)->default('standard');
            $table->integer('priority')->default(50);
            $table->boolean('is_authoritative')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('last_successful_collection')->nullable();
            $table->integer('consecutive_failures')->default(0);
            $table->integer('health_score')->default(100);
            $table->string('contact_email')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['community_id', 'source_type']);
            $table->index('is_active');
        });
    }

    public function down(): void { Schema::dropIfExists('news_sources'); }
};

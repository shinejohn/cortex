<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_methods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('source_id');
            $table->foreign('source_id')->references('id')->on('news_sources')->cascadeOnDelete();
            $table->string('method_type', 20);
            $table->string('name')->nullable();
            $table->text('endpoint_url')->nullable();
            $table->integer('poll_interval_minutes')->default(60);
            $table->string('feed_format', 20)->nullable();
            $table->timestamp('feed_last_modified')->nullable();
            $table->string('feed_etag')->nullable();
            $table->string('intake_email')->nullable();
            $table->text('signup_url')->nullable();
            $table->string('subscription_status', 20)->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('last_email_received_at')->nullable();
            $table->integer('emails_received_count')->default(0);
            $table->jsonb('scrape_config')->nullable();
            $table->boolean('requires_javascript')->default(false);
            $table->jsonb('platform_config')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->boolean('is_primary')->default(false);
            $table->timestamp('last_collected_at')->nullable();
            $table->timestamp('last_successful_at')->nullable();
            $table->integer('last_items_found')->default(0);
            $table->integer('total_items_collected')->default(0);
            $table->integer('consecutive_failures')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamps();
            $table->index(['source_id', 'method_type']);
            $table->index(['method_type', 'is_enabled']);
        });
    }

    public function down(): void { Schema::dropIfExists('collection_methods'); }
};

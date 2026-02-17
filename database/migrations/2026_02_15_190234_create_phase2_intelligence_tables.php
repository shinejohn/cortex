<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reporter_outreach_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id');
            $table->unsignedBigInteger('day_news_post_id');
            $table->uuid('business_id')->nullable();
            $table->string('contact_email');
            $table->string('email_subject');
            $table->text('email_body');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('response_received_at')->nullable();
            $table->string('status', 30)->default('pending')
                ->comment('pending|sent|responded|bounced|failed');
            $table->timestamps();
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');
            $table->foreign('day_news_post_id')->references('id')->on('day_news_posts')->onDelete('cascade');
            $table->foreign('business_id')->references('id')->on('businesses')->onDelete('set null');
            $table->index(['region_id', 'status']);
            $table->index('sent_at');
        });

        Schema::create('reporter_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('outreach_request_id');
            $table->text('raw_email_content');
            $table->json('extracted_quotes')->nullable();
            $table->string('sentiment', 20)->nullable()->comment('positive|neutral|negative');
            $table->boolean('usable')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->foreign('outreach_request_id')->references('id')->on('reporter_outreach_requests')->onDelete('cascade');
            $table->index('outreach_request_id');
        });

        Schema::create('search_trends', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id');
            $table->string('query');
            $table->integer('search_volume')->nullable();
            $table->string('trend_direction', 20)->nullable()->comment('rising|stable|declining');
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamps();
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');
            $table->index(['region_id', 'last_checked_at']);
            $table->unique(['region_id', 'query']);
        });

        Schema::create('seo_targets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id');
            $table->string('target_keyword');
            $table->integer('search_volume')->nullable();
            $table->string('competition_level', 20)->nullable()->comment('low|medium|high');
            $table->integer('content_gap_score')->nullable()->comment('0-100, higher = bigger gap');
            $table->string('assigned_service', 50)->nullable()
                ->comment('filler|top_list|article_generation');
            $table->unsignedBigInteger('article_id')->nullable()->comment('DayNewsPost id when assigned');
            $table->timestamps();
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');
            $table->index(['region_id', 'content_gap_score']);
            $table->index('assigned_service');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_targets');
        Schema::dropIfExists('search_trends');
        Schema::dropIfExists('reporter_responses');
        Schema::dropIfExists('reporter_outreach_requests');
    }
};

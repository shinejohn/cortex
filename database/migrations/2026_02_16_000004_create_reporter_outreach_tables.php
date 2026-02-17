<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('community_leaders')) {
            Schema::create('community_leaders', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('region_id')->index();
                $table->string('name');
                $table->string('title')->nullable();
                $table->string('organization')->nullable();
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('preferred_contact_method')->default('email');
                $table->string('category');
                $table->json('expertise_topics')->nullable();
                $table->boolean('is_influencer')->default(false);
                $table->integer('influence_score')->default(50);
                $table->integer('times_contacted')->default(0);
                $table->integer('times_responded')->default(0);
                $table->decimal('avg_response_time_hours', 8, 2)->nullable();
                $table->timestamp('last_contacted_at')->nullable();
                $table->boolean('do_not_contact')->default(false);
                $table->timestamps();

                $table->index(['region_id', 'category']);
            });
        }

        if (! Schema::hasTable('quote_requests')) {
            Schema::create('quote_requests', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('leader_id');
                $table->uuid('news_article_draft_id')->nullable();
                $table->string('status')->default('pending');
                $table->string('contact_method');
                $table->text('context');
                $table->text('questions');
                $table->timestamp('sent_at')->nullable();
                $table->timestamp('responded_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->text('response')->nullable();
                $table->boolean('approved_for_publication')->default(false);
                $table->timestamps();

                $table->foreign('leader_id')->references('id')->on('community_leaders')->cascadeOnDelete();
                $table->index(['leader_id', 'status']);
            });
        }

        if (! Schema::hasTable('reporter_outreach_log')) {
            Schema::create('reporter_outreach_log', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('leader_id');
                $table->uuid('quote_request_id')->nullable();
                $table->string('action');
                $table->json('metadata')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('leader_id')->references('id')->on('community_leaders')->cascadeOnDelete();
                $table->index(['leader_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reporter_outreach_log');
        Schema::dropIfExists('quote_requests');
        Schema::dropIfExists('community_leaders');
    }
};

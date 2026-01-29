<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('raw_content')) {
            Schema::create('raw_content', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('source_id')->nullable();
$1// FK DISABLED: $2
                $table->uuid('collection_method_id')->nullable();
$1// FK DISABLED: $2
                $table->unsignedBigInteger('community_id')->nullable();
                $table->unsignedBigInteger('region_id')->nullable();
                $table->text('source_url')->nullable();
                $table->text('source_title');
                $table->longText('source_content');
                $table->text('source_excerpt')->nullable();
                $table->longText('source_html')->nullable();
                $table->timestamp('source_published_at')->nullable();
                $table->string('source_author')->nullable();
                $table->jsonb('source_images')->nullable();
                $table->string('content_hash', 64);
                $table->string('title_hash', 64)->nullable();
                $table->timestamp('collected_at')->useCurrent();
                $table->string('collection_method', 20);
                $table->jsonb('raw_metadata')->nullable();
                $table->string('email_from')->nullable();
                $table->string('email_subject')->nullable();
                $table->uuid('incoming_email_id')->nullable();
                $table->string('classification_status', 20)->default('pending');
                $table->timestamp('classified_at')->nullable();
                $table->text('classification_error')->nullable();
                $table->string('classification_model')->nullable();
                $table->jsonb('content_types')->nullable();
                $table->string('primary_type', 30)->nullable();
                $table->jsonb('categories')->nullable();
                $table->jsonb('tags')->nullable();
                $table->jsonb('businesses_mentioned')->nullable();
                $table->jsonb('people_mentioned')->nullable();
                $table->jsonb('locations_mentioned')->nullable();
                $table->jsonb('organizations_mentioned')->nullable();
                $table->jsonb('dates_mentioned')->nullable();
                $table->boolean('has_event')->default(false);
                $table->jsonb('event_data')->nullable();
                $table->integer('local_relevance_score')->nullable();
                $table->text('local_relevance_reason')->nullable();
                $table->integer('news_value_score')->nullable();
                $table->text('news_value_reason')->nullable();
                $table->string('processing_tier', 10)->nullable();
                $table->string('priority', 10)->default('normal');
                $table->jsonb('processing_recommendation')->nullable();
                $table->text('suggested_headline')->nullable();
                $table->string('processing_status', 20)->default('pending');
                $table->timestamp('processed_at')->nullable();
                $table->text('processing_error')->nullable();
                $table->string('skip_reason')->nullable();
                $table->jsonb('output_ids')->nullable();
                $table->foreignId('article_id')->nullable();
                $table->foreignId('event_id')->nullable();
                $table->boolean('has_sales_opportunity')->default(false);
                $table->jsonb('sales_flag')->nullable();
                $table->boolean('was_published')->default(false);
                $table->timestamps();
                $table->unique(['content_hash', 'community_id']);
                $table->index('classification_status');
                $table->index('processing_status');
                $table->index(['processing_status', 'priority']);
                $table->index('collected_at');
                $table->index('has_event');
                $table->index('has_sales_opportunity');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('raw_content');
    }
};

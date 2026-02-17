<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filler_buckets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id');
            $table->string('bucket_type', 50)
                ->comment('seasonal|evergreen|data_driven|business_spotlight|community_history');
            $table->string('topic');
            $table->integer('article_count')->default(0);
            $table->integer('min_threshold')->default(3);
            $table->integer('max_capacity')->default(10);
            $table->timestamp('last_deployed_at')->nullable();
            $table->timestamp('last_replenished_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['region_id', 'bucket_type']);
            $table->index(['is_active', 'article_count']);
        });

        Schema::create('filler_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('bucket_id');
            $table->uuid('region_id');
            $table->string('title');
            $table->text('content');
            $table->text('excerpt')->nullable();
            $table->json('seo_metadata')->nullable();
            $table->string('featured_image_url')->nullable();
            $table->string('status', 20)->default('ready')
                ->comment('ready|deployed|expired|archived');
            $table->timestamp('deployed_at')->nullable();
            $table->uuid('published_post_id')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->timestamps();
            $table->foreign('bucket_id')->references('id')->on('filler_buckets')->onDelete('cascade');
            $table->index(['bucket_id', 'status']);
            $table->index(['region_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filler_articles');
        Schema::dropIfExists('filler_buckets');
    }
};

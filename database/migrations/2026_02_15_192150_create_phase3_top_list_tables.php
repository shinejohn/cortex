<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('top_list_topics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id');
            $table->string('category', 50);
            $table->string('places_type', 50)->nullable()->comment('Google Places API type for discovery');
            $table->string('topic_slug', 100);
            $table->string('display_name');
            $table->timestamp('last_published_at')->nullable();
            $table->timestamp('next_scheduled_at')->nullable();
            $table->integer('search_volume')->nullable();
            $table->json('seasonality_peak_months')->nullable()->comment('[1,2,3] for Jan-Mar');
            $table->timestamps();
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');
            $table->unique(['region_id', 'topic_slug']);
            $table->index(['region_id', 'next_scheduled_at']);
        });

        Schema::create('top_list_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('topic_id');
            $table->uuid('region_id');
            $table->unsignedBigInteger('editorial_post_id')->nullable();
            $table->uuid('poll_id')->nullable();
            $table->unsignedBigInteger('results_post_id')->nullable();
            $table->string('status', 30)->default('editorial_published')
                ->comment('editorial_published|voting|results_published');
            $table->timestamps();
            $table->foreign('topic_id')->references('id')->on('top_list_topics')->onDelete('cascade');
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('cascade');
            $table->index(['topic_id', 'status']);
            $table->index(['region_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('top_list_articles');
        Schema::dropIfExists('top_list_topics');
    }
};

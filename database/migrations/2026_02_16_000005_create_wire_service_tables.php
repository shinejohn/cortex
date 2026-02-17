<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('wire_service_feeds')) {
            Schema::create('wire_service_feeds', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->string('service_provider');
                $table->string('feed_url');
                $table->string('feed_format')->default('rss');
                $table->json('geographic_filters')->nullable();
                $table->json('industry_filters')->nullable();
                $table->boolean('is_enabled')->default(true);
                $table->timestamp('last_polled_at')->nullable();
                $table->integer('polling_interval_minutes')->default(15);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('wire_service_runs')) {
            Schema::create('wire_service_runs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('feed_id');
                $table->integer('items_found')->default(0);
                $table->integer('items_new')->default(0);
                $table->integer('items_duplicate')->default(0);
                $table->integer('items_geographic_match')->default(0);
                $table->timestamp('started_at');
                $table->timestamp('completed_at')->nullable();
                $table->text('error')->nullable();

                $table->foreign('feed_id')->references('id')->on('wire_service_feeds')->cascadeOnDelete();
                $table->index(['feed_id', 'started_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('wire_service_runs');
        Schema::dropIfExists('wire_service_feeds');
    }
};

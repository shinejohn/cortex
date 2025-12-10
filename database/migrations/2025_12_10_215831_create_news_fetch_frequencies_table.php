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
        Schema::create('news_fetch_frequencies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('category')->index();
            $table->string('category_type'); // 'news_category' or 'business_category'
            $table->string('frequency_type'); // 'daily', 'weekly', 'monthly', 'custom_days'
            $table->unsignedInteger('custom_interval_days')->nullable();
            $table->timestamp('last_fetched_at')->nullable()->index();
            $table->boolean('is_enabled')->default(true)->index();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['category', 'category_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_fetch_frequencies');
    }
};

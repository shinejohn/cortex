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
        Schema::create('ad_placements', function (Blueprint $table) {
            $table->id();
            $table->string('platform'); // day_news, goeventcity, downtown_guide, alphasite_community, golocalvoices
            $table->string('slot'); // header_leaderboard, sidebar_top, in_article, footer, etc.
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('format'); // leaderboard, medium_rectangle, etc.
            $table->integer('width');
            $table->integer('height');
            $table->decimal('base_cpm', 8, 2);
            $table->decimal('base_cpc', 8, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->timestamps();
            $table->unique(['platform', 'slot']);
            $table->index('platform');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_placements');
    }
};

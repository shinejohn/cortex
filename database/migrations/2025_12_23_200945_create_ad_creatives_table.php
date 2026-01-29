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
        Schema::create('ad_creatives', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('campaign_id');
            $table->string('name');
            $table->enum('format', ['leaderboard', 'medium_rectangle', 'sidebar', 'native', 'sponsored_article', 'audio', 'video']);
            $table->string('headline')->nullable();
            $table->text('body')->nullable();
            $table->string('image_url')->nullable();
            $table->string('video_url')->nullable();
            $table->string('audio_url')->nullable();
            $table->string('click_url');
            $table->string('cta_text')->default('Learn More');
            $table->enum('status', ['draft', 'pending_review', 'approved', 'rejected', 'active', 'paused'])->default('draft');
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['campaign_id', 'status']);
            $table->index('format');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_creatives');
    }
};

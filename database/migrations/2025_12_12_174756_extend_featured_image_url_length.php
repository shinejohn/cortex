<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Unsplash URLs can exceed 255 characters due to long query parameters.
     * Change featured_image_url from varchar(255) to text.
     */
    public function up(): void
    {
        Schema::table('news_article_drafts', function (Blueprint $table) {
            $table->text('featured_image_url')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('news_article_drafts', function (Blueprint $table) {
            $table->string('featured_image_url')->nullable()->change();
        });
    }
};

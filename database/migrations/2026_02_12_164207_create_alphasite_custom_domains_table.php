<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_domains', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('domain', 255)->unique();
            $table->string('status', 50)->default('pending'); // pending, active, failed, suspended
            $table->string('ssl_certificate_id', 255)->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->boolean('dns_verified')->default(false);
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('local_voices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('author')->nullable();
            $table->string('url')->nullable();
            $table->string('type', 50)->default('article'); // article, podcast, video, interview
            $table->string('duration')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'type']);
        });

        Schema::create('photo_contributions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->string('caption')->nullable();
            $table->string('contributor')->nullable();
            $table->boolean('approved')->default(false);
            $table->timestamp('contributed_at')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'approved']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_contributions');
        Schema::dropIfExists('local_voices');
        Schema::dropIfExists('custom_domains');
    }
};

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
        Schema::create('user_behavioral_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('category_affinities')->nullable();
            $table->json('temporal_patterns')->nullable();
            $table->json('spending_patterns')->nullable();
            $table->json('geographic_preferences')->nullable();
            $table->integer('engagement_score')->default(0);
            $table->json('auto_segments')->nullable();
            $table->timestamp('last_computed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_behavioral_profiles');
    }
};

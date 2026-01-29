<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('influencers', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Context
            $table->unsignedBigInteger('region_id');

            // Profile
            $table->string('name');
            $table->string('role')->nullable(); // e.g. "City Council Member", "Business Owner"
            $table->string('email')->nullable();
            $table->json('social_handles')->nullable(); // {twitter: @handle, linkedin: url}

            // Intelligence
            $table->integer('influence_score')->default(0); // 0-100
            $table->json('topics_of_interest')->nullable(); // ["zoning", "parks"]
            $table->timestamp('last_interaction_at')->nullable();

            $table->timestamps();

            $table->index(['region_id', 'influence_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('influencers');
    }
};

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
        Schema::create('community_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Context
            $table->foreignId('region_id')->constrained();
            $table->foreignUuid('story_thread_id')->nullable();

            // Event
            $table->string('event_type'); // e.g. 'election_result', 'business_opening', 'disaster'
            $table->string('title');
            $table->text('summary');
            $table->date('occurred_at');

            // Metadata
            $table->json('key_figures')->nullable(); // Snapshot of who was involved
            $table->json('impact_metrics')->nullable(); // Economic value, people affected, etc

            $table->timestamps();

            $table->index(['region_id', 'event_type']);
            $table->index('occurred_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_logs');
    }
};

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
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('image')->nullable();
            $table->dateTime('event_date');
            $table->string('time');
            $table->text('description');

            // Event organization
            $table->json('badges')->nullable(); // Array of badges
            $table->json('subcategories')->nullable(); // Array of subcategories
            $table->string('category')->nullable();

            // Pricing
            $table->boolean('is_free')->default(false);
            $table->decimal('price_min', 10, 2)->default(0);
            $table->decimal('price_max', 10, 2)->default(0);

            // Community and engagement
            $table->decimal('community_rating', 3, 2)->default(0);
            $table->integer('member_attendance')->default(0);
            $table->integer('member_recommendations')->default(0);
            $table->string('discussion_thread_id')->nullable();
            $table->text('curator_notes')->nullable();

            // Location
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Relationships - workspace-centric
            $table->foreignUuid('venue_id')->nullable()->constrained('venues')->onDelete('set null');
            $table->foreignUuid('performer_id')->nullable()->constrained('performers')->onDelete('set null');
            $table->foreignUuid('workspace_id')->constrained('workspaces')->onDelete('cascade');
            $table->foreignUuid('created_by')->nullable()->constrained('users')->onDelete('set null'); // Event creator

            // Event status
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('draft');

            $table->timestamps();

            // Indexes
            $table->index(['status', 'event_date']);
            $table->index(['venue_id', 'event_date']);
            $table->index(['performer_id', 'event_date']);
            $table->index('category');
            $table->index('community_rating');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};

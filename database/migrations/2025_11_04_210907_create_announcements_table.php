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
        if (Schema::hasTable('announcements')) {
            return;
        }
        
        Schema::create('announcements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('workspace_id')->nullable();
            $table->enum('type', [
                'wedding',
                'engagement',
                'birth',
                'graduation',
                'anniversary',
                'celebration',
                'general',
                'community_event',
                'public_notice',
                'emergency_alert',
                'meeting',
                'volunteer_opportunity',
                'road_closure',
                'school_announcement',
            ]);
            $table->string('title');
            $table->text('content');
            $table->string('image')->nullable();
            $table->string('location')->nullable();
            $table->date('event_date')->nullable();
            $table->enum('status', ['draft', 'pending', 'published', 'expired', 'removed'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('reactions_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index(['status', 'published_at']);
            $table->index(['user_id', 'status']);
            $table->index('event_date');
        });

        // Announcement regions pivot table
        Schema::create('announcement_region', function (Blueprint $table) {
            $table->id();
            $table->uuid('announcement_id');
            $table->uuid('region_id');
            $table->timestamps();

            $table->unique(['announcement_id', 'region_id']);
        });

        // Announcement reactions (using polymorphic Rating model)
        // No separate table needed - using existing ratings table
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcement_region');
        Schema::dropIfExists('announcements');
    }
};


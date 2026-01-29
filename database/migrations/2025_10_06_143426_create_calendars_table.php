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
        Schema::create('calendars', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->string('image')->nullable();
            $table->text('about')->nullable();
            $table->string('location')->nullable();
            $table->string('update_frequency')->default('weekly');
            $table->decimal('subscription_price', 10, 2)->default(0);
            $table->boolean('is_private')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->integer('followers_count')->default(0);
            $table->integer('events_count')->default(0);
            $table->timestamps();
        });

        Schema::create('calendar_followers', function (Blueprint $table) {
            $table->id();
            $table->uuid('calendar_id');
            $table->uuid('user_id');
            $table->timestamps();

            $table->unique(['calendar_id', 'user_id']);
        });

        Schema::create('calendar_roles', function (Blueprint $table) {
            $table->id();
            $table->uuid('calendar_id');
            $table->uuid('user_id');
            $table->string('role')->default('editor');
            $table->timestamps();

            $table->unique(['calendar_id', 'user_id']);
        });

        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('calendar_id');
            $table->uuid('event_id');
            $table->uuid('added_by')->nullable();
            $table->integer('position')->default(0);
            $table->timestamps();

            $table->unique(['calendar_id', 'event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('calendar_roles');
        Schema::dropIfExists('calendar_followers');
        Schema::dropIfExists('calendars');
    }
};

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
        Schema::create('memorials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('workspace_id')->nullable();
            $table->string('name');
            $table->string('years'); // e.g., "1932 - 2023"
            $table->date('date_of_passing');
            $table->text('obituary');
            $table->string('image')->nullable();
            $table->string('location')->nullable();
            $table->date('service_date')->nullable();
            $table->string('service_location')->nullable();
            $table->text('service_details')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['draft', 'published', 'removed'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('reactions_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestamps();

            $table->index(['status', 'published_at']);
            $table->index(['date_of_passing', 'status']);
            $table->index('is_featured');
        });

        Schema::create('memorial_region', function (Blueprint $table) {
            $table->id();
            $table->uuid('memorial_id');
            $table->uuid('region_id');
            $table->timestamps();

            $table->unique(['memorial_id', 'region_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memorial_region');
        Schema::dropIfExists('memorials');
    }
};


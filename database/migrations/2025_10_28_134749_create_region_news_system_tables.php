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
        // Regions table - hierarchical geographic regions
        Schema::create('regions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['state', 'county', 'city', 'neighborhood']);
            $table->uuid('parent_id')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->json('metadata')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('type');
            $table->index('parent_id');
            $table->index('is_active');
            $table->index(['latitude', 'longitude']);
        });

        // Add self-referencing foreign key after table creation
        Schema::table('regions', function (Blueprint $table) {
// FK DISABLED
        });

        // Region zipcodes table - links zipcodes to regions
        Schema::create('region_zipcodes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id');
            $table->string('zipcode', 10);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['region_id', 'zipcode']);
            $table->index('zipcode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('region_zipcodes');
        Schema::dropIfExists('regions');
    }
};

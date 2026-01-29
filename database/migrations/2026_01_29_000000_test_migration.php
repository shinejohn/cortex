<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Simple test migration to verify AWS ECS migration infrastructure works.
 * If this migration runs successfully, we know the pipeline is working
 * and any failures are due to migration file structure, not infrastructure.
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only create if doesn't exist (safe for re-runs)
        if (!Schema::hasTable('migration_test')) {
            Schema::create('migration_test', function (Blueprint $table) {
                $table->id();
                $table->string('test_value')->default('success');
                $table->timestamp('tested_at')->useCurrent();
                $table->timestamps();
            });
            
            // Insert a test record to prove it worked
            \DB::table('migration_test')->insert([
                'test_value' => 'Migration infrastructure verified at ' . now()->toIso8601String(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('migration_test');
    }
};

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
        if (Schema::hasTable('search_history')) {
            return;
        }
        
        // Search history table
        Schema::create('search_history', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('query');
            $table->unsignedInteger('results_count')->default(0);
            $table->json('filters')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['query', 'created_at']);
            $table->index('created_at');
        });

        // Search suggestions table
        Schema::create('search_suggestions', function (Blueprint $table) {
            $table->id();
            $table->string('query')->unique();
            $table->unsignedInteger('popularity')->default(1);
            $table->unsignedInteger('click_count')->default(0);
            $table->timestamps();

            $table->index('popularity');
            $table->index('query');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_suggestions');
        Schema::dropIfExists('search_history');
    }
};


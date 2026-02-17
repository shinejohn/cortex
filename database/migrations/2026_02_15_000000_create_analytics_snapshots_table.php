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
        Schema::create('business_analytics_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->json('metrics')->nullable(); // General metrics like traffic
            $table->json('financials')->nullable(); // Revenue, MRR, etc.
            $table->json('interactions')->nullable(); // Conversations, calls, bookings
            $table->timestamps();

            $table->unique(['business_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_analytics_snapshots');
    }
};

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
        Schema::create('upcoming_shows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('performer_id')->constrained('performers')->onDelete('cascade');
            $table->date('date');
            $table->string('venue');
            $table->boolean('tickets_available')->default(true);
            $table->string('ticket_url')->nullable();
            $table->decimal('ticket_price', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['performer_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upcoming_shows');
    }
};

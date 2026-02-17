<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_commissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_agent_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('agent_client_id')->constrained()->cascadeOnDelete();
            $table->string('source_type');
            $table->string('source_id');
            $table->unsignedInteger('gross_amount_cents');
            $table->decimal('commission_rate', 5, 4);
            $table->unsignedInteger('commission_amount_cents');
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['booking_agent_id', 'status']);
            $table->index(['agent_client_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_commissions');
    }
};

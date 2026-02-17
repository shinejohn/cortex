<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_intervention_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('content_type');
            $table->string('content_id');
            $table->string('trigger_signal');
            $table->integer('total_comments')->default(0);
            $table->integer('compliant_comments')->default(0);
            $table->integer('non_compliant_comments')->default(0);
            $table->decimal('civil_discourse_ratio', 5, 4)->default(0);
            $table->integer('unique_complaints')->default(0);
            $table->string('outcome');
            $table->text('outcome_reason');
            $table->timestamps();

            $table->index(['content_type', 'content_id']);
            $table->index(['outcome']);
            $table->index(['trigger_signal']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_intervention_logs');
    }
};

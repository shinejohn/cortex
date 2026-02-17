<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('performer_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('fan_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('event_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('amount_cents');
            $table->unsignedInteger('platform_fee_cents')->default(0);
            $table->unsignedInteger('stripe_fee_cents')->default(0);
            $table->unsignedInteger('net_amount_cents')->default(0);
            $table->string('status')->default('pending');
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->string('stripe_charge_id')->nullable();
            $table->string('payment_method_type')->nullable();
            $table->text('fan_message')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->timestamps();

            $table->index(['performer_id', 'status', 'created_at']);
            $table->index(['fan_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tips');
    }
};

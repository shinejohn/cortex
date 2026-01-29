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
        Schema::create('ticket_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('max_quantity');
            $table->integer('available_quantity');
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

// FK DISABLED
            $table->index(['event_id', 'is_active']);
        });

        Schema::create('ticket_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id');
            $table->uuid('user_id');
            $table->string('status')->default('pending');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('fees', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->json('promo_code')->nullable();
            $table->json('billing_info')->nullable();
            $table->string('payment_intent_id')->nullable();
            $table->string('payment_status')->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

// FK DISABLED
// FK DISABLED
            $table->index(['user_id', 'status']);
            $table->index(['event_id', 'status']);
        });

        Schema::create('ticket_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticket_order_id');
            $table->uuid('ticket_plan_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();

// FK DISABLED
// FK DISABLED
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_order_items');
        Schema::dropIfExists('ticket_orders');
        Schema::dropIfExists('ticket_plans');
    }
};

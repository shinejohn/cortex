<?php

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
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('type'); // percentage or fixed
            $table->decimal('value', 10, 2);
            $table->decimal('min_purchase', 10, 2)->nullable();
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->json('applicable_to')->nullable(); // event_ids, event_categories, etc.
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['code', 'is_active']);
            $table->index(['expires_at']);
        });

        Schema::create('promo_code_usages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('promo_code_id');
            $table->uuid('user_id');
            $table->uuid('ticket_order_id');
            $table->decimal('discount_amount', 10, 2);
            $table->decimal('original_amount', 10, 2);
            $table->decimal('final_amount', 10, 2);
            $table->timestamp('used_at');
            $table->timestamps();

// FK DISABLED
// FK DISABLED
// FK DISABLED
            $table->index(['promo_code_id', 'used_at']);
            $table->index(['user_id', 'used_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promo_code_usages');
        Schema::dropIfExists('promo_codes');
    }
};

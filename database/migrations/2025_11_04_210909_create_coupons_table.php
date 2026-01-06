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
        if (Schema::hasTable('coupons')) {
            return;
        }
        
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained('businesses')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed_amount', 'buy_one_get_one', 'free_item'])->default('percentage');
            $table->decimal('discount_value', 10, 2)->nullable(); // Percentage or fixed amount
            $table->text('terms')->nullable();
            $table->string('code')->unique()->nullable(); // Optional coupon code
            $table->string('image')->nullable();
            $table->string('business_name');
            $table->string('business_location')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('usage_limit')->nullable(); // Max number of uses
            $table->unsignedInteger('used_count')->default(0);
            $table->enum('status', ['draft', 'active', 'expired', 'disabled'])->default('draft');
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('clicks_count')->default(0);
            $table->timestamps();

            $table->index(['status', 'start_date', 'end_date']);
            $table->index(['business_id', 'status']);
            $table->index('code');
            $table->index('end_date');
        });

        // Coupon regions pivot table
        Schema::create('coupon_region', function (Blueprint $table) {
            $table->id();
            $table->uuid('coupon_id')->constrained('coupons')->cascadeOnDelete();
            $table->foreignUuid('region_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['coupon_id', 'region_id']);
        });

        // Coupon usage tracking
        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->uuid('coupon_id')->constrained('coupons')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index(['coupon_id', 'created_at']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupon_usages');
        Schema::dropIfExists('coupon_region');
        Schema::dropIfExists('coupons');
    }
};


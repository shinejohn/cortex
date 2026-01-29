<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable()->cascadeOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->timestamps();

            $table->index(['user_id', 'session_id']);
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cart_id');
            $table->uuid('product_id');
            $table->uuid('store_id');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 10, 2);
            $table->timestamps();

            $table->unique(['cart_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
    }
};

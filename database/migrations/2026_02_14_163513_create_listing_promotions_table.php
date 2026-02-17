<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listing_promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('promotable_type');
            $table->uuid('promotable_id');
            $table->string('tier');
            $table->uuid('community_id')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('price_paid', 10, 2);
            $table->uuid('purchased_by');
            $table->string('status')->default('active');
            $table->string('stripe_payment_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('purchased_by')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['promotable_type', 'promotable_id']);
            $table->index(['tier', 'community_id', 'start_date', 'end_date', 'status']);
            $table->unique(['promotable_type', 'tier', 'community_id', 'start_date'], 'unique_headliner_slot');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_promotions');
    }
};

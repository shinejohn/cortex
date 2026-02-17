<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_agents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('agency_name');
            $table->string('slug')->unique();
            $table->text('bio')->nullable();
            $table->json('specialties')->nullable();
            $table->string('subscription_tier')->default('free');
            $table->string('stripe_customer_id')->nullable();
            $table->string('stripe_subscription_id')->nullable();
            $table->string('subscription_status')->default('inactive');
            $table->unsignedInteger('max_clients')->default(3);
            $table->boolean('is_marketplace_visible')->default(true);
            $table->json('service_areas')->nullable();
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->unsignedInteger('total_bookings')->default(0);
            $table->timestamps();

            $table->index(['subscription_tier', 'is_marketplace_visible']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_agents');
    }
};

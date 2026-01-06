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
        Schema::create('newsletter_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscriber_id')->constrained('email_subscribers')->cascadeOnDelete();
            $table->enum('tier', ['free', 'paid'])->default('free');
            $table->decimal('price', 6, 2)->default(1.00);
            $table->string('stripe_subscription_id')->nullable();
            $table->enum('status', ['active', 'cancelled', 'past_due', 'paused'])->default('active');
            $table->timestamp('started_at');
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamps();
            $table->index(['subscriber_id', 'status']);
            $table->index('stripe_subscription_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscriptions');
    }
};

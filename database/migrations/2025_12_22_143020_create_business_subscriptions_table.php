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
        Schema::create('business_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            
            // Subscription Status
            $table->string('tier', 50)->default('trial'); // trial, basic, standard, premium, enterprise
            $table->string('status', 50)->default('active'); // active, expired, cancelled, suspended
            
            // Trial Period (90 days)
            $table->timestamp('trial_started_at')->useCurrent();
            $table->timestamp('trial_expires_at');
            $table->timestamp('trial_converted_at')->nullable();
            
            // Active Subscription
            $table->timestamp('subscription_started_at')->nullable();
            $table->timestamp('subscription_expires_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            
            // Billing
            $table->string('stripe_subscription_id')->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->decimal('monthly_amount', 10, 2)->nullable();
            $table->string('billing_cycle', 20)->default('monthly'); // monthly, annual
            
            // AI Services Enabled
            $table->json('ai_services_enabled')->default('[]');
            
            // Metadata
            $table->uuid('claimed_by_id')->nullable();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('downgraded_at')->nullable();
            
            $table->timestamps();
            
            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('claimed_by_id')->references('id')->on('users')->nullOnDelete();
            
            $table->index('business_id');
            $table->index('status');
            $table->index('tier');
            $table->index('trial_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_subscriptions');
    }
};

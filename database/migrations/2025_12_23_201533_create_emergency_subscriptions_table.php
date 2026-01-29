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
        Schema::create('emergency_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('subscriber_id');
            $table->boolean('email_enabled')->default(true);
            $table->boolean('sms_enabled')->default(false);
            $table->string('phone_number')->nullable();
            $table->boolean('phone_verified')->default(false);
            $table->string('phone_verification_code')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->json('priority_levels')->nullable(); // which priorities to receive
            $table->json('categories')->nullable(); // which categories to receive
            $table->string('stripe_subscription_id')->nullable(); // for SMS tier
            $table->enum('sms_tier', ['none', 'basic'])->default('none');
            $table->timestamps();
            $table->unique('subscriber_id');
            $table->index(['sms_enabled', 'phone_verified']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_subscriptions');
    }
};

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
        Schema::create('emergency_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alert_id')->constrained('emergency_alerts')->cascadeOnDelete();
            $table->foreignId('subscription_id')->constrained('emergency_subscriptions')->cascadeOnDelete();
            $table->enum('channel', ['email', 'sms']);
            $table->enum('status', ['queued', 'sent', 'delivered', 'failed'])->default('queued');
            $table->string('external_id')->nullable(); // SES message ID or SNS message ID
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
            $table->unique(['alert_id', 'subscription_id', 'channel']);
            $table->index(['alert_id', 'status']);
            $table->index('sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_deliveries');
    }
};

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
        Schema::create('notification_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            
            // Platform identification
            $table->enum('platform', ['daynews', 'goeventcity', 'downtownguide', 'alphasite'])->index();
            $table->string('community_id', 100)->nullable()->index();
            $table->uuid('business_id')->nullable(); // for Alphasite SMB notifications
            
            // Subscription endpoints
            $table->string('phone_number', 20)->nullable()->index();
            $table->boolean('phone_verified')->default(false);
            $table->timestamp('phone_verified_at')->nullable();
            
            // Web Push subscription (browser)
            $table->text('web_push_endpoint')->nullable();
            $table->string('web_push_p256dh', 255)->nullable();
            $table->string('web_push_auth', 255)->nullable();
            
            // SNS ARNs (populated after subscription)
            $table->string('sns_sms_subscription_arn', 255)->nullable();
            $table->string('sns_endpoint_arn', 255)->nullable(); // for mobile app push
            
            // Preferences
            $table->json('notification_types')->default('["breaking_news", "events", "deals"]');
            $table->enum('frequency', ['instant', 'daily_digest', 'weekly_digest'])->default('instant');
            $table->time('quiet_hours_start')->default('22:00');
            $table->time('quiet_hours_end')->default('08:00');
            
            // Status
            $table->enum('status', ['active', 'paused', 'unsubscribed'])->default('active')->index();
            
            // Tracking
            $table->timestamps();
            $table->timestamp('last_notification_at')->nullable();
            
            // Unique constraint: one subscription per user/platform/community
            $table->unique(['user_id', 'platform', 'community_id'], 'unique_user_platform_community');
            
            // Composite index for querying active subscriptions
            $table->index(['platform', 'community_id', 'status'], 'idx_platform_community_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_subscriptions');
    }
};

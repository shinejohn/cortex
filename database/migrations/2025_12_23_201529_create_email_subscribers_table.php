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
        Schema::create('email_subscribers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('email')->index();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->foreignId('community_id')->constrained('communities')->cascadeOnDelete();
            $table->foreignId('business_id')->nullable()->constrained('businesses')->nullOnDelete();
            $table->enum('type', ['reader', 'smb'])->default('reader');
            $table->enum('status', ['pending', 'active', 'unsubscribed', 'bounced', 'complained'])->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->string('unsubscribe_reason')->nullable();
            $table->json('preferences')->nullable(); // daily_digest, breaking_news, weekly_newsletter
            $table->string('source')->nullable(); // signup_form, import, api, claim
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['email', 'community_id']);
            $table->index(['community_id', 'status', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_subscribers');
    }
};

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
        Schema::create('emergency_alerts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('community_id');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreignId('municipal_partner_id')->nullable();
            $table->enum('priority', ['critical', 'urgent', 'advisory', 'info'])->default('advisory');
            $table->string('category'); // weather, crime, health, utility, traffic, government, school, amber
            $table->string('title');
            $table->text('message');
            $table->text('instructions')->nullable();
            $table->string('source')->nullable();
            $table->string('source_url')->nullable();
            $table->enum('status', ['draft', 'active', 'expired', 'cancelled'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->json('delivery_channels')->nullable(); // email, sms, push
            $table->integer('email_sent')->default(0);
            $table->integer('sms_sent')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['community_id', 'status', 'priority']);
            $table->index(['status', 'published_at']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_alerts');
    }
};

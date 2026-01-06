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
        Schema::create('ad_campaigns', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('advertiser_id')->constrained('businesses')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'pending', 'active', 'paused', 'completed', 'cancelled'])->default('draft');
            $table->enum('type', ['cpm', 'cpc', 'flat_rate', 'sponsored']);
            $table->decimal('budget', 12, 2);
            $table->decimal('spent', 12, 2)->default(0);
            $table->decimal('daily_budget', 10, 2)->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->json('targeting')->nullable(); // communities, demographics, etc.
            $table->json('platforms')->nullable(); // day_news, goeventcity, etc.
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'start_date', 'end_date']);
            $table->index('advertiser_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_campaigns');
    }
};

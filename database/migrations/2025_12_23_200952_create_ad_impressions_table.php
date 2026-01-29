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
        Schema::create('ad_impressions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('creative_id');
            $table->unsignedBigInteger('placement_id');
            $table->unsignedBigInteger('community_id')->nullable();
            $table->string('session_id', 64)->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('referrer')->nullable();
            $table->decimal('cost', 8, 4)->default(0);
            $table->timestamp('impressed_at');
            $table->timestamps();
            $table->index(['creative_id', 'impressed_at']);
            $table->index(['placement_id', 'impressed_at']);
            $table->index(['community_id', 'impressed_at']);
            $table->index('impressed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_impressions');
    }
};

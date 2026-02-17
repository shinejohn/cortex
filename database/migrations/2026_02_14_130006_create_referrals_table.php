<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('referrer_id')->index();
            $table->uuid('referred_user_id')->index();
            $table->string('referral_code', 50);
            $table->string('status', 20)->default('pending');
            $table->integer('referrer_reward_points')->default(0);
            $table->integer('referred_reward_points')->default(0);
            $table->string('source', 50)->default('direct');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('created_at');

            $table->unique(['referrer_id', 'referred_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};

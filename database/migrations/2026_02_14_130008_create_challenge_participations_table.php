<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenge_participations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('challenge_id')->index();
            $table->uuid('user_id')->index();
            $table->jsonb('progress')->default('{}');
            $table->timestamp('completed_at')->nullable();
            $table->boolean('rewards_claimed')->default(false);
            $table->timestamp('joined_at');

            $table->unique(['challenge_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_participations');
    }
};

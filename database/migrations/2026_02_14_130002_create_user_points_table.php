<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_points', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->index()->unique();
            $table->integer('points_balance')->default(0);
            $table->integer('lifetime_points')->default(0);
            $table->string('current_level', 50)->default('Bronze');
            $table->integer('level_progress')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_points');
    }
};

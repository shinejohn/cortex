<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_enrollments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->index();
            $table->uuid('loyalty_program_id')->index();
            $table->uuid('business_id')->index();
            $table->integer('points_balance')->default(0);
            $table->string('current_tier', 50)->default('member');
            $table->integer('visits_count')->default(0);
            $table->decimal('total_spent', 10, 2)->default(0);
            $table->timestamp('enrolled_at');
            $table->timestamps();

            $table->unique(['user_id', 'loyalty_program_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_enrollments');
    }
};

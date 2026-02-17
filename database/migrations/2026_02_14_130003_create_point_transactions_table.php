<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->index();
            $table->string('transaction_type', 20); // earned, spent, bonus, penalty
            $table->integer('points');
            $table->string('source', 50); // review, check_in, etc.
            $table->uuid('source_id')->nullable();
            $table->uuid('business_id')->nullable()->index();
            $table->string('description', 255)->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};

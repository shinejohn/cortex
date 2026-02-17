<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->text('description');
            $table->string('challenge_type', 50);
            $table->jsonb('requirements'); // JSONB supported in Postgres
            $table->jsonb('rewards');
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->integer('participant_limit')->default(0);
            $table->integer('current_participants')->default(0);
            $table->uuid('business_id')->nullable()->index();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenges');
    }
};

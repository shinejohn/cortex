<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_programs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('program_type', 50)->default('points');
            $table->decimal('points_per_dollar', 8, 2)->default(1.00);
            $table->jsonb('tiers')->default('[]');
            $table->jsonb('rewards_catalog')->default('[]');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_programs');
    }
};

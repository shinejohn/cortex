<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_flyers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('performer_id')->constrained()->cascadeOnDelete();
            $table->string('template')->default('default');
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('qr_code_data');
            $table->string('qr_image_path')->nullable();
            $table->string('flyer_image_path')->nullable();
            $table->unsignedInteger('scan_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['performer_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_flyers');
    }
};

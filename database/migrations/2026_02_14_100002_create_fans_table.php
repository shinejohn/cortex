<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('performer_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('source')->default('landing_page');
            $table->unsignedInteger('tip_count')->default(0);
            $table->unsignedBigInteger('total_tips_given_cents')->default(0);
            $table->timestamp('last_interaction_at')->nullable();
            $table->timestamp('converted_to_user_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['performer_id', 'email']);
            $table->index(['performer_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fans');
    }
};

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
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('provider');
            $table->string('provider_id')->unique();
            $table->string('name')->nullable();
            $table->longText('token')->nullable();
            $table->longText('refresh_token')->nullable();
            $table->longText('avatar')->nullable();
            $table->longText('code')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['provider', 'user_id', 'provider_id', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};

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
        Schema::create('ad_clicks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('impression_id');
            $table->unsignedBigInteger('creative_id');
            $table->string('ip_hash', 64)->nullable();
            $table->decimal('cost', 8, 4)->default(0);
            $table->timestamp('clicked_at');
            $table->timestamps();
            $table->index(['creative_id', 'clicked_at']);
            $table->index('clicked_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_clicks');
    }
};

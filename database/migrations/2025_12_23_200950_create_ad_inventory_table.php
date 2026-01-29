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
        Schema::create('ad_inventory', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('placement_id');
            $table->unsignedBigInteger('community_id');
            $table->date('date');
            $table->integer('total_impressions')->default(0);
            $table->integer('sold_impressions')->default(0);
            $table->integer('delivered_impressions')->default(0);
            $table->decimal('revenue', 10, 2)->default(0);
            $table->timestamps();
            $table->unique(['placement_id', 'community_id', 'date']);
            $table->index(['date', 'placement_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_inventory');
    }
};

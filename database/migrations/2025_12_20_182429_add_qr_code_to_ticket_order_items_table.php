<?php

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
        Schema::table('ticket_order_items', function (Blueprint $table) {
            $table->string('ticket_code')->unique()->nullable()->after('total_price');
            $table->string('qr_code')->nullable()->after('ticket_code');
            $table->index('ticket_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket_order_items', function (Blueprint $table) {
            $table->dropIndex(['ticket_code']);
            $table->dropColumn(['ticket_code', 'qr_code']);
        });
    }
};

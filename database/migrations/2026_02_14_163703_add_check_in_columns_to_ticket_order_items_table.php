<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_order_items', function (Blueprint $table) {
            $table->timestamp('checked_in_at')->nullable()->after('qr_code');
            $table->uuid('checked_in_by')->nullable()->after('checked_in_at');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_order_items', function (Blueprint $table) {
            $table->dropColumn(['checked_in_at', 'checked_in_by']);
        });
    }
};

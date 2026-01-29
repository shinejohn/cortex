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
        Schema::create('ticket_gifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticket_order_item_id');
            $table->uuid('gifter_id');
            $table->string('recipient_email');
            $table->string('recipient_name')->nullable();
            $table->uuid('recipient_user_id')->nullable();
            $table->string('status')->default('pending'); // pending, redeemed, cancelled, expired
            $table->string('gift_token')->unique();
            $table->text('message')->nullable();
            $table->timestamp('gifted_at')->nullable();
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

$1// FK DISABLED: $2
$1// FK DISABLED: $2
$1// FK DISABLED: $2
            $table->index(['gifter_id', 'status']);
            $table->index(['recipient_email', 'status']);
            $table->index(['gift_token']);
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_gifts');
    }
};

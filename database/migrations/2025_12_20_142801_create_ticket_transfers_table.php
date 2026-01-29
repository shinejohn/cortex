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
        Schema::create('ticket_transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticket_order_item_id');
            $table->uuid('from_user_id');
            $table->uuid('to_user_id')->nullable();
            $table->string('to_email');
            $table->string('status')->default('pending'); // pending, completed, cancelled, expired
            $table->string('transfer_token')->unique();
            $table->text('message')->nullable();
            $table->timestamp('transferred_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

// FK DISABLED
// FK DISABLED
// FK DISABLED
            $table->index(['from_user_id', 'status']);
            $table->index(['to_email', 'status']);
            $table->index(['transfer_token']);
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_transfers');
    }
};

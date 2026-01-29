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
        Schema::create('ticket_listings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticket_order_item_id');
            $table->uuid('seller_id');
            $table->uuid('event_id');
            $table->decimal('price', 10, 2);
            $table->integer('quantity');
            $table->string('status')->default('active'); // active, sold, cancelled, expired
            $table->text('description')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('sold_at')->nullable();
            $table->uuid('sold_to')->nullable();
            $table->timestamps();

$1// FK DISABLED: $2
$1// FK DISABLED: $2
$1// FK DISABLED: $2
$1// FK DISABLED: $2
            $table->index(['event_id', 'status']);
            $table->index(['seller_id', 'status']);
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_listings');
    }
};

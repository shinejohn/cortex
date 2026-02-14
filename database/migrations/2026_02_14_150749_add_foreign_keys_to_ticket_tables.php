<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_plans', function (Blueprint $table) {
            $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
        });

        Schema::table('ticket_orders', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
        });

        Schema::table('ticket_order_items', function (Blueprint $table) {
            $table->foreign('ticket_order_id')->references('id')->on('ticket_orders')->cascadeOnDelete();
            $table->foreign('ticket_plan_id')->references('id')->on('ticket_plans')->cascadeOnDelete();
        });

        Schema::table('ticket_listings', function (Blueprint $table) {
            $table->foreign('ticket_order_item_id')->references('id')->on('ticket_order_items')->cascadeOnDelete();
            $table->foreign('seller_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
            if (Schema::hasColumn('ticket_listings', 'sold_to')) {
                $table->foreign('sold_to')->references('id')->on('users')->nullOnDelete();
            }
        });

        Schema::table('ticket_transfers', function (Blueprint $table) {
            $table->foreign('ticket_order_item_id')->references('id')->on('ticket_order_items')->cascadeOnDelete();
            $table->foreign('from_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('to_user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('ticket_gifts', function (Blueprint $table) {
            $table->foreign('ticket_order_item_id')->references('id')->on('ticket_order_items')->cascadeOnDelete();
            $table->foreign('gifter_id')->references('id')->on('users')->cascadeOnDelete();
            if (Schema::hasColumn('ticket_gifts', 'recipient_user_id')) {
                $table->foreign('recipient_user_id')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('ticket_plans', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
        });

        Schema::table('ticket_orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['event_id']);
        });

        Schema::table('ticket_order_items', function (Blueprint $table) {
            $table->dropForeign(['ticket_order_id']);
            $table->dropForeign(['ticket_plan_id']);
        });

        Schema::table('ticket_listings', function (Blueprint $table) {
            $table->dropForeign(['ticket_order_item_id']);
            $table->dropForeign(['seller_id']);
            $table->dropForeign(['event_id']);
            if (Schema::hasColumn('ticket_listings', 'sold_to')) {
                $table->dropForeign(['sold_to']);
            }
        });

        Schema::table('ticket_transfers', function (Blueprint $table) {
            $table->dropForeign(['ticket_order_item_id']);
            $table->dropForeign(['from_user_id']);
            $table->dropForeign(['to_user_id']);
        });

        Schema::table('ticket_gifts', function (Blueprint $table) {
            $table->dropForeign(['ticket_order_item_id']);
            $table->dropForeign(['gifter_id']);
            if (Schema::hasColumn('ticket_gifts', 'recipient_user_id')) {
                $table->dropForeign(['recipient_user_id']);
            }
        });
    }
};

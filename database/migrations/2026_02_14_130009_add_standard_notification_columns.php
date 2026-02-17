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
        Schema::table('notifications', function (Blueprint $table) {
            if (! Schema::hasColumn('notifications', 'notifiable_id')) {
                $table->string('notifiable_id')->nullable();
            }

            if (! Schema::hasColumn('notifications', 'notifiable_type')) {
                $table->string('notifiable_type')->nullable();
            }

            if (! Schema::hasColumn('notifications', 'read_at')) {
                $table->timestamp('read_at')->nullable();
            }
        });

        // Make existing columns nullable for Laravel notification compatibility
        if (Schema::hasColumn('notifications', 'user_id')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->uuid('user_id')->nullable()->change();
            });
        }

        if (Schema::hasColumn('notifications', 'title')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->string('title')->nullable()->change();
            });
        }

        if (Schema::hasColumn('notifications', 'message')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->text('message')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'notifiable_id')) {
                $table->dropColumn('notifiable_id');
            }

            if (Schema::hasColumn('notifications', 'notifiable_type')) {
                $table->dropColumn('notifiable_type');
            }

            if (Schema::hasColumn('notifications', 'read_at')) {
                $table->dropColumn('read_at');
            }
        });
    }
};

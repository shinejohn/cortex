<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'total_points' => fn () => $table->integer('total_points')->default(0),
                'lifetime_points' => fn () => $table->integer('lifetime_points')->default(0),
                'current_level' => fn () => $table->string('current_level', 50)->default('Bronze'),
                'level_progress' => fn () => $table->integer('level_progress')->default(0),
                'referral_code' => fn () => $table->string('referral_code', 50)->unique()->nullable(),
                'referred_by_id' => fn () => $table->uuid('referred_by_id')->nullable()->index(),
                'account_type' => fn () => $table->string('account_type', 20)->default('user'),
                'phone' => fn () => $table->string('phone', 20)->nullable(),
                'bio' => fn () => $table->text('bio')->nullable(),
                'city' => fn () => $table->string('city', 100)->nullable(),
                'state' => fn () => $table->string('state', 50)->nullable(),
                'zip_code' => fn () => $table->string('zip_code', 20)->nullable(),
                'latitude' => fn () => $table->decimal('latitude', 10, 8)->nullable(),
                'longitude' => fn () => $table->decimal('longitude', 11, 8)->nullable(),
                'interests' => fn () => $table->jsonb('interests')->default('[]'),
                'privacy_settings' => fn () => $table->jsonb('privacy_settings')->default('{}'),
                'notification_prefs' => fn () => $table->jsonb('notification_prefs')->default('{}'),
                'last_active_at' => fn () => $table->timestamp('last_active_at')->nullable(),
            ];

            foreach ($columns as $column => $add) {
                if (! Schema::hasColumn('users', $column)) {
                    $add();
                }
            }
        });
    }

    public function down(): void
    {
        $columnsToDrop = array_filter([
            'total_points',
            'lifetime_points',
            'current_level',
            'level_progress',
            'referral_code',
            'referred_by_id',
            'account_type',
            'phone',
            'city',
            'state',
            'zip_code',
            'latitude',
            'longitude',
            'interests',
            'privacy_settings',
            'notification_prefs',
        ], fn ($col) => Schema::hasColumn('users', $col));

        if ($columnsToDrop !== []) {
            Schema::table('users', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }
    }
};

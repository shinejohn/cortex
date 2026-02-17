<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_ins', function (Blueprint $table) {
            $table->string('checkable_type')->nullable()->after('event_id');
            $table->uuid('checkable_id')->nullable()->after('checkable_type');
        });

        $eventModel = App\Models\Event::class;
        foreach (DB::table('check_ins')->whereNotNull('event_id')->get(['id', 'event_id']) as $row) {
            DB::table('check_ins')->where('id', $row->id)->update([
                'checkable_type' => $eventModel,
                'checkable_id' => $row->event_id,
            ]);
        }

        Schema::table('check_ins', function (Blueprint $table) {
            $table->dropUnique(['event_id', 'user_id']);
            $table->uuid('event_id')->nullable()->change();
            $table->index(['checkable_type', 'checkable_id']);
            $table->unique(['checkable_type', 'checkable_id', 'user_id'], 'check_ins_checkable_user_unique');
        });
    }

    public function down(): void
    {
        Schema::table('check_ins', function (Blueprint $table) {
            $table->dropUnique('check_ins_checkable_user_unique');
            $table->dropIndex(['checkable_type', 'checkable_id']);
        });

        Schema::table('check_ins', function (Blueprint $table) {
            $table->dropColumn(['checkable_type', 'checkable_id']);
            $table->uuid('event_id')->nullable(false)->change();
            $table->unique(['event_id', 'user_id']);
        });
    }
};

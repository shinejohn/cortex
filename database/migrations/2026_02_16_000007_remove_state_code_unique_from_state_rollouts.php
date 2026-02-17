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
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list('state_rollouts')");
            foreach ($indexes as $idx) {
                if (($idx->unique ?? 0) === 1 && str_contains($idx->name ?? '', 'state_code')) {
                    DB::statement('DROP INDEX IF EXISTS "'.$idx->name.'"');
                    break;
                }
            }
        } else {
            Schema::table('state_rollouts', function (Blueprint $table) {
                $table->dropUnique(['state_code']);
            });
        }
    }

    public function down(): void
    {
        Schema::table('state_rollouts', function (Blueprint $table) {
            $table->unique('state_code');
        });
    }
};

<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            if (! Schema::hasColumn('businesses', 'smb_business_id')) {
                $table->uuid('smb_business_id')->nullable()->after('id');
                $table->index('smb_business_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            if (Schema::hasColumn('businesses', 'smb_business_id')) {
                $table->dropIndex(['smb_business_id']);
                $table->dropColumn('smb_business_id');
            }
        });
    }
};

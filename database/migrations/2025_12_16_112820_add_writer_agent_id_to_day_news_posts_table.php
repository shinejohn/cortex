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
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->foreignUuid('writer_agent_id')
                ->nullable()
                ->after('author_id')
                ->constrained('writer_agents')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('day_news_posts', function (Blueprint $table) {
            $table->dropForeign(['writer_agent_id']);
            $table->dropColumn('writer_agent_id');
        });
    }
};

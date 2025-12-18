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
        Schema::create('writer_agents', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Identity
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();

            // Persona configuration
            $table->string('writing_style')->default('conversational');
            $table->json('persona_traits')->nullable();
            $table->json('expertise_areas')->nullable();

            // Specializations
            $table->json('categories')->default('[]');

            // AI Prompts
            $table->json('prompts')->default('{}');

            // Statistics
            $table->unsignedInteger('articles_count')->default(0);

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index('is_active');
            $table->index('writing_style');
        });

        Schema::create('writer_agent_region', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('writer_agent_id')->constrained('writer_agents')->cascadeOnDelete();
            $table->foreignUuid('region_id')->constrained('regions')->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['writer_agent_id', 'region_id']);
            $table->index('region_id');
        });

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

        Schema::dropIfExists('writer_agent_region');
        Schema::dropIfExists('writer_agents');
    }
};

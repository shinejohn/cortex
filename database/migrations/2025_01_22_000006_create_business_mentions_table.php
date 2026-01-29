<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('business_mentions')) {
            Schema::create('business_mentions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->unsignedBigInteger('business_id')->nullable();
                $table->string('business_name');
                $table->string('business_name_normalized')->nullable();
                $table->unsignedBigInteger('community_id')->nullable();
                $table->uuid('raw_content_id')->nullable();
$1// FK DISABLED: $2
                $table->foreignId('article_id')->nullable();
                $table->foreignId('published_article_id')->nullable();
                $table->string('mention_type', 30)->default('mentioned');
                $table->string('sentiment', 20)->default('neutral');
                $table->text('mention_context')->nullable();
                $table->timestamp('mentioned_at')->useCurrent();
                $table->boolean('is_primary')->default(false);
                $table->boolean('notified_sales')->default(false);
                $table->decimal('confidence', 3, 2)->default(1.00);
                $table->timestamps();
                $table->index(['business_id', 'mentioned_at']);
                $table->index('business_name');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('business_mentions');
    }
};

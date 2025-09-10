<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

final class CreateTableMagicLinks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('magic_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('token', 255);
            $table->text('action');
            $table->unsignedTinyInteger('num_visits')->default(0);
            $table->unsignedTinyInteger('max_visits')->nullable();
            $table->timestamp('available_at')->nullable();
            $table->string('access_code')->nullable();
            $table->timestamps();

            $table->index('available_at');
            $table->index('max_visits');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('magic_links');
    }
}

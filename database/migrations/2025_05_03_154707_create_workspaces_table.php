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
        Schema::create('workspaces', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('owner_id');
            $table->string('name');
            $table->string('slug')->unique();
            $table->longText('logo')->nullable();
            $table->string('timezone')->default('UTC');
            $table->string('stripe_connect_id')->nullable()->unique();
            $table->boolean('stripe_charges_enabled')->default(false);
            $table->boolean('stripe_payouts_enabled')->default(false);
            $table->boolean('stripe_admin_approved')->default(false);
            $table->timestamps();

            $table->index(['owner_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->uuid('current_workspace_id')->nullable();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->text('name')->primary();
            $table->timestamps();
        });

        Schema::create('workspace_memberships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('user_id');
            $table->text('role');
            $table->foreign('role')->references('name')->on('roles');
            $table->timestamps();

            $table->index(['workspace_id', 'user_id', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspaces');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('workspace_memberships');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('current_workspace_id');
        });
    }
};

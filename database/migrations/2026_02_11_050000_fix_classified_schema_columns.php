<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fix classified_images and classifieds column names to match models.
     * Idempotent: safe to run on both local SQLite and production PostgreSQL.
     */
    public function up(): void
    {
        // =====================================================================
        // 1. Fix classified_images: rename image_path→path, image_disk→disk, add is_primary
        // =====================================================================
        if (Schema::hasTable('classified_images')) {
            if (Schema::hasColumn('classified_images', 'image_path') && ! Schema::hasColumn('classified_images', 'path')) {
                Schema::table('classified_images', function (Blueprint $table) {
                    $table->renameColumn('image_path', 'path');
                });
            }

            if (Schema::hasColumn('classified_images', 'image_disk') && ! Schema::hasColumn('classified_images', 'disk')) {
                Schema::table('classified_images', function (Blueprint $table) {
                    $table->renameColumn('image_disk', 'disk');
                });
            }

            if (! Schema::hasColumn('classified_images', 'is_primary')) {
                Schema::table('classified_images', function (Blueprint $table) {
                    $table->boolean('is_primary')->default(false)->after('order');
                });
            }
        }

        // =====================================================================
        // 2. Fix classifieds: rename views_count→view_count, add missing columns
        // =====================================================================
        if (Schema::hasTable('classifieds')) {
            if (Schema::hasColumn('classifieds', 'views_count') && ! Schema::hasColumn('classifieds', 'view_count')) {
                Schema::table('classifieds', function (Blueprint $table) {
                    $table->renameColumn('views_count', 'view_count');
                });
            }

            Schema::table('classifieds', function (Blueprint $table) {
                if (! Schema::hasColumn('classifieds', 'saves_count')) {
                    $table->integer('saves_count')->default(0);
                }
                if (! Schema::hasColumn('classifieds', 'contact_email')) {
                    $table->string('contact_email')->nullable();
                }
                if (! Schema::hasColumn('classifieds', 'contact_phone')) {
                    $table->string('contact_phone')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('classified_images')) {
            if (Schema::hasColumn('classified_images', 'path') && ! Schema::hasColumn('classified_images', 'image_path')) {
                Schema::table('classified_images', function (Blueprint $table) {
                    $table->renameColumn('path', 'image_path');
                });
            }

            if (Schema::hasColumn('classified_images', 'disk') && ! Schema::hasColumn('classified_images', 'image_disk')) {
                Schema::table('classified_images', function (Blueprint $table) {
                    $table->renameColumn('disk', 'image_disk');
                });
            }

            if (Schema::hasColumn('classified_images', 'is_primary')) {
                Schema::table('classified_images', function (Blueprint $table) {
                    $table->dropColumn('is_primary');
                });
            }
        }

        if (Schema::hasTable('classifieds')) {
            if (Schema::hasColumn('classifieds', 'view_count') && ! Schema::hasColumn('classifieds', 'views_count')) {
                Schema::table('classifieds', function (Blueprint $table) {
                    $table->renameColumn('view_count', 'views_count');
                });
            }

            Schema::table('classifieds', function (Blueprint $table) {
                $cols = [];
                foreach (['saves_count', 'contact_email', 'contact_phone'] as $col) {
                    if (Schema::hasColumn('classifieds', $col)) {
                        $cols[] = $col;
                    }
                }
                if (! empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};

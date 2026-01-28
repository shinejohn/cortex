<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MigrationChainTest extends TestCase
{
    public function test_tables_exist()
    {
        $tables = [
            'users',
            'workspaces',
            'events',
            'venues',
            'performers',
            'bookings',
            'reviews',
            'ratings'
        ];

        foreach ($tables as $table) {
            $exists = Schema::hasTable($table);
            if (!$exists) {
                $this->fail("Table '$table' does not exist. Migrations likely stopped before this.");
            }
            $this->assertTrue($exists, "Table '$table' exists");
        }
    }
}

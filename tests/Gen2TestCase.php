<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class Gen2TestCase extends BaseTestCase
{
    // use CreatesApplication; // File not found, implementing manually
    use RefreshDatabase;

    public function createApplication()
    {
        $app = require __DIR__ . '/../bootstrap/app.php';
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure APP_KEY
        if (empty(config('app.key'))) {
            config(['app.key' => 'base64:' . base64_encode(random_bytes(32))]);
        }

        // Basic configuration
        config([
            'cache.default' => 'array',
            'queue.default' => 'sync',
            'mail.default' => 'array',
            'session.driver' => 'array',
        ]);

        Http::preventStrayRequests();
        Storage::fake('public');
    }
}

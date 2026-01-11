<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure APP_KEY is set for tests
        if (empty(config('app.key'))) {
            config(['app.key' => 'base64:'.base64_encode(random_bytes(32))]);
        }
        
        // Create fake Vite manifest for tests
        \Tests\Helpers\ViteHelper::createFakeManifest();
        
        // Prevent accidental external HTTP calls in tests
        Http::preventStrayRequests();
        
        // Ensure storage is faked by default for tests
        // Individual tests can override this if needed
        if (!Storage::fake('public')) {
            Storage::fake('public');
        }
        
        // Set default test configuration
        config([
            'cache.default' => 'array',
            'queue.default' => 'sync',
            'mail.default' => 'array',
            'session.driver' => 'array',
        ]);
    }
    
    protected function tearDown(): void
    {
        // Clean up any mocks
        if (class_exists('Mockery')) {
            \Mockery::close();
        }
        
        parent::tearDown();
    }
}

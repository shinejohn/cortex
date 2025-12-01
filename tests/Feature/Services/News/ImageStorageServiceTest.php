<?php

declare(strict_types=1);

use App\Services\News\ImageStorageService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->service = new ImageStorageService;

    // Fake the storage disk
    Storage::fake('public');
    Storage::fake('s3');

    // Set default config
    Config::set('news-workflow.unsplash.storage.disk', 'public');
    Config::set('news-workflow.unsplash.storage.path', 'news-images');
});

it('downloads and stores an image successfully', function () {
    Http::fake([
        'https://example.com/image.jpg' => Http::response('fake-image-content', 200),
    ]);

    $result = $this->service->downloadAndStore('https://example.com/image.jpg', 'test-photo-123');

    expect($result)->toHaveKeys(['storage_path', 'storage_disk', 'public_url']);
    expect($result['storage_disk'])->toBe('public');
    expect($result['storage_path'])->toContain('news-images');
    expect($result['storage_path'])->toContain('test-photo-123.jpg');

    // Verify file was stored
    Storage::disk('public')->assertExists($result['storage_path']);
});

it('generates correct path structure with year and month', function () {
    Http::fake([
        '*' => Http::response('fake-image-content', 200),
    ]);

    $result = $this->service->downloadAndStore('https://example.com/image.jpg', 'photo-456');

    $year = date('Y');
    $month = date('m');

    expect($result['storage_path'])->toContain("news-images/{$year}/{$month}/photo-456.jpg");
});

it('uses configured disk from config', function () {
    Config::set('news-workflow.unsplash.storage.disk', 's3');

    Http::fake([
        '*' => Http::response('fake-image-content', 200),
    ]);

    $result = $this->service->downloadAndStore('https://example.com/image.jpg', 'photo-789');

    expect($result['storage_disk'])->toBe('s3');
    Storage::disk('s3')->assertExists($result['storage_path']);
});

it('supports custom file extensions', function () {
    Http::fake([
        '*' => Http::response('fake-image-content', 200),
    ]);

    $result = $this->service->downloadAndStore('https://example.com/image.png', 'photo-png', 'png');

    expect($result['storage_path'])->toContain('photo-png.png');
});

it('throws exception when download fails', function () {
    Http::fake([
        '*' => Http::response('', 404),
    ]);

    $this->service->downloadAndStore('https://example.com/nonexistent.jpg', 'fail-photo');
})->throws(Exception::class, 'Image storage failed');

it('throws exception when image content is empty', function () {
    Http::fake([
        '*' => Http::response('', 200),
    ]);

    $this->service->downloadAndStore('https://example.com/empty.jpg', 'empty-photo');
})->throws(Exception::class, 'Downloaded image content is empty');

it('returns public URL for stored image', function () {
    Http::fake([
        '*' => Http::response('fake-image-content', 200),
    ]);

    $result = $this->service->downloadAndStore('https://example.com/image.jpg', 'url-photo');

    expect($result['public_url'])->toBeString();
    expect($result['public_url'])->toContain('url-photo.jpg');
});

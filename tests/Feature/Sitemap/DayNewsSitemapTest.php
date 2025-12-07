<?php

declare(strict_types=1);

use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\Workspace;
use Illuminate\Support\Facades\Cache;

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
    config(['domains.day-news' => 'daynews.test']);
    $this->baseUrl = 'http://daynews.test';
    // Clear cache to ensure fresh sitemap generation
    Cache::flush();
});

describe('robots.txt', function () {
    it('returns valid robots.txt with sitemap reference', function () {
        $response = $this->get($this->baseUrl.'/robots.txt');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $response->assertSee('User-agent: *');
        $response->assertSee('Allow: /');
        $response->assertSee('Sitemap: https://daynews.test/sitemap.xml');
    });
});

describe('sitemap index', function () {
    it('returns valid XML sitemap index', function () {
        $response = $this->get($this->baseUrl.'/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<sitemapindex', false);
        $response->assertSee('sitemap-static.xml', false);
        $response->assertSee('sitemap-regions.xml', false);
        $response->assertSee('sitemap-posts.xml', false);
    });
});

describe('static sitemap', function () {
    it('returns valid XML with static pages', function () {
        $response = $this->get($this->baseUrl.'/sitemap-static.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
        $response->assertSee('https://daynews.test', false);
    });
});

describe('posts sitemap', function () {
    it('returns empty sitemap when no published posts', function () {
        $response = $this->get($this->baseUrl.'/sitemap-posts.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
    });

    it('includes only published posts', function () {
        $workspace = Workspace::factory()->create();
        $publishedPost = DayNewsPost::factory()->create([
            'status' => 'published',
            'published_at' => now()->subDay(),
            'expires_at' => null,
            'workspace_id' => $workspace->id,
        ]);
        $draftPost = DayNewsPost::factory()->create([
            'status' => 'draft',
            'published_at' => null,
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->get($this->baseUrl.'/sitemap-posts.xml');

        $response->assertOk();
        $response->assertSee("/posts/{$publishedPost->slug}", false);
        $response->assertDontSee("/posts/{$draftPost->slug}", false);
    });

    it('excludes expired posts', function () {
        $workspace = Workspace::factory()->create();
        $expiredPost = DayNewsPost::factory()->create([
            'status' => 'published',
            'published_at' => now()->subWeek(),
            'expires_at' => now()->subDay(),
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->get($this->baseUrl.'/sitemap-posts.xml');

        $response->assertOk();
        $response->assertDontSee("/posts/{$expiredPost->slug}", false);
    });

    it('includes lastmod date', function () {
        $workspace = Workspace::factory()->create();
        DayNewsPost::factory()->create([
            'status' => 'published',
            'published_at' => now()->subDay(),
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->get($this->baseUrl.'/sitemap-posts.xml');

        $response->assertOk();
        $response->assertSee('<lastmod>', false);
    });
});

describe('pagination', function () {
    it('handles paginated posts sitemap', function () {
        $response = $this->get($this->baseUrl.'/sitemap-posts-1.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
    });
});

describe('regions sitemap', function () {
    it('returns valid XML with region pages', function () {
        $response = $this->get($this->baseUrl.'/sitemap-regions.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
    });

    it('includes only active regions', function () {
        $activeRegion = Region::factory()->create([
            'slug' => 'chicago',
            'is_active' => true,
        ]);
        $inactiveRegion = Region::factory()->create([
            'slug' => 'inactive-city',
            'is_active' => false,
        ]);

        $response = $this->get($this->baseUrl.'/sitemap-regions.xml');

        $response->assertOk();
        $response->assertSee('/chicago', false);
        $response->assertDontSee('/inactive-city', false);
    });

    it('uses correct URL format for regions', function () {
        Region::factory()->create([
            'slug' => 'new-york-city',
            'is_active' => true,
        ]);

        $response = $this->get($this->baseUrl.'/sitemap-regions.xml');

        $response->assertOk();
        $response->assertSee('https://daynews.test/new-york-city', false);
    });

    it('is cached for performance', function () {
        Region::factory()->create([
            'slug' => 'test-region',
            'is_active' => true,
        ]);

        // First request - should cache
        $this->get($this->baseUrl.'/sitemap-regions.xml');

        // Check cache exists
        expect(Cache::has('sitemap:day-news:regions'))->toBeTrue();
    });
});

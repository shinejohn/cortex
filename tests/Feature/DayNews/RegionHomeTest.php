<?php

declare(strict_types=1);

use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\Workspace;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
    config(['domains.day-news' => 'daynews.test']);
    $this->baseUrl = 'http://daynews.test';

    $this->region = Region::factory()->create([
        'name' => 'Chicago',
        'slug' => 'chicago',
        'type' => 'city',
        'is_active' => true,
    ]);

    $this->workspace = Workspace::factory()->create();
});

describe('region homepage', function () {
    it('displays region-specific news page', function () {
        $response = get($this->baseUrl.'/chicago');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('day-news/index')
            ->has('hasRegion')
            ->where('hasRegion', true)
        );
    });

    it('stores region preference in session when visiting region URL', function () {
        get($this->baseUrl.'/chicago');

        expect(session('user_location_region_id'))->toBe($this->region->id);
        expect(session('user_location_confirmed'))->toBeTrue();
    });

    it('returns 404 for non-existent region slug', function () {
        $response = get($this->baseUrl.'/non-existent-region');

        $response->assertNotFound();
    });

    it('returns 404 for inactive region', function () {
        $inactiveRegion = Region::factory()->create([
            'slug' => 'inactive-city',
            'is_active' => false,
        ]);

        $response = get($this->baseUrl.'/inactive-city');

        $response->assertNotFound();
    });

    it('shows posts filtered by the region', function () {
        $regionPost = DayNewsPost::factory()->create([
            'status' => 'published',
            'published_at' => now()->subDay(),
            'expires_at' => null,
            'workspace_id' => $this->workspace->id,
        ]);
        $regionPost->regions()->attach($this->region);

        $otherRegion = Region::factory()->create(['is_active' => true]);
        $otherPost = DayNewsPost::factory()->create([
            'status' => 'published',
            'published_at' => now()->subDay(),
            'expires_at' => null,
            'workspace_id' => $this->workspace->id,
        ]);
        $otherPost->regions()->attach($otherRegion);

        $response = get($this->baseUrl.'/chicago');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('day-news/index')
            ->has('news', 1)
            ->where('news.0.id', $regionPost->id)
        );
    });

    it('handles hyphenated region slugs', function () {
        $hyphenatedRegion = Region::factory()->create([
            'name' => 'New York City',
            'slug' => 'new-york-city',
            'is_active' => true,
        ]);

        $response = get($this->baseUrl.'/new-york-city');

        $response->assertOk();
    });

    it('includes SEO data with region name', function () {
        $response = get($this->baseUrl.'/chicago');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('day-news/index')
            ->has('seo.jsonLd')
        );
    });
});

describe('route priority', function () {
    it('does not conflict with posts route', function () {
        $post = DayNewsPost::factory()->create([
            'status' => 'published',
            'published_at' => now()->subDay(),
            'slug' => 'test-article',
            'workspace_id' => $this->workspace->id,
        ]);

        $response = get($this->baseUrl.'/posts/test-article');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('day-news/posts/show')
        );
    });

    it('does not conflict with sitemap routes', function () {
        $response = get($this->baseUrl.'/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
    });

    it('does not conflict with API routes', function () {
        $response = get($this->baseUrl.'/api/location/search?query=test');

        $response->assertOk();
    });
});

describe('backward compatibility', function () {
    it('homepage still works without region slug', function () {
        $response = get($this->baseUrl.'/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('day-news/index')
        );
    });

    it('does not conflict with register route', function () {
        // Register route should NOT return 404 (region not found)
        $response = get($this->baseUrl.'/register');

        // Should not be 404 - that would mean region route caught it
        $response->assertStatus(200);
    });
});

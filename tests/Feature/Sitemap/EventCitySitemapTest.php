<?php

declare(strict_types=1);

use App\Models\Calendar;
use App\Models\Community;
use App\Models\Event;
use App\Models\Performer;
use App\Models\User;
use App\Models\Venue;
use App\Models\Workspace;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    // Set domain configuration for tests
    config(['domains.event-city' => 'goeventcity.test']);
    // Clear cache to ensure fresh sitemap generation
    Cache::flush();
});

describe('robots.txt', function () {
    it('returns valid robots.txt with sitemap reference', function () {
        $response = $this->get('/robots.txt');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $response->assertSee('User-agent: *');
        $response->assertSee('Allow: /');
        $response->assertSee('Sitemap: https://goeventcity.test/sitemap.xml');
    });
});

describe('sitemap index', function () {
    it('returns valid XML sitemap index', function () {
        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<sitemapindex', false);
        $response->assertSee('sitemap-static.xml', false);
        $response->assertSee('sitemap-events.xml', false);
        $response->assertSee('sitemap-venues.xml', false);
        $response->assertSee('sitemap-performers.xml', false);
        $response->assertSee('sitemap-calendars.xml', false);
        $response->assertSee('sitemap-community.xml', false);
    });
});

describe('static sitemap', function () {
    it('returns valid XML with static pages', function () {
        $response = $this->get('/sitemap-static.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
        $response->assertSee('https://goeventcity.test', false);
        $response->assertSee('https://goeventcity.test/events', false);
        $response->assertSee('https://goeventcity.test/venues', false);
        $response->assertSee('https://goeventcity.test/performers', false);
        $response->assertSee('https://goeventcity.test/calendars', false);
        $response->assertSee('https://goeventcity.test/tickets', false);
    });
});

describe('events sitemap', function () {
    it('returns empty sitemap when no published events', function () {
        $response = $this->get('/sitemap-events.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
    });

    it('includes only published events', function () {
        $workspace = Workspace::factory()->create();
        $publishedEvent = Event::factory()->create([
            'status' => 'published',
            'workspace_id' => $workspace->id,
        ]);
        $draftEvent = Event::factory()->create([
            'status' => 'draft',
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->get('/sitemap-events.xml');

        $response->assertOk();
        $response->assertSee("/events/{$publishedEvent->id}", false);
        $response->assertDontSee("/events/{$draftEvent->id}", false);
    });

    it('includes lastmod date', function () {
        $workspace = Workspace::factory()->create();
        Event::factory()->create([
            'status' => 'published',
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->get('/sitemap-events.xml');

        $response->assertOk();
        $response->assertSee('<lastmod>', false);
    });
});

describe('venues sitemap', function () {
    it('returns empty sitemap when no active venues', function () {
        $response = $this->get('/sitemap-venues.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
    });

    it('includes only active venues', function () {
        $workspace = Workspace::factory()->create();
        $activeVenue = Venue::factory()->create([
            'status' => 'active',
            'workspace_id' => $workspace->id,
        ]);
        $inactiveVenue = Venue::factory()->create([
            'status' => 'inactive',
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->get('/sitemap-venues.xml');

        $response->assertOk();
        $response->assertSee("/venues/{$activeVenue->id}", false);
        $response->assertDontSee("/venues/{$inactiveVenue->id}", false);
    });
});

describe('performers sitemap', function () {
    it('returns empty sitemap when no active performers', function () {
        $response = $this->get('/sitemap-performers.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
    });

    it('includes only active performers', function () {
        $workspace = Workspace::factory()->create();
        $activePerformer = Performer::factory()->create([
            'status' => 'active',
            'workspace_id' => $workspace->id,
        ]);
        $inactivePerformer = Performer::factory()->create([
            'status' => 'inactive',
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->get('/sitemap-performers.xml');

        $response->assertOk();
        $response->assertSee("/performers/{$activePerformer->id}", false);
        $response->assertDontSee("/performers/{$inactivePerformer->id}", false);
    });
});

describe('calendars sitemap', function () {
    it('returns empty sitemap when no public calendars', function () {
        $response = $this->get('/sitemap-calendars.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
    });

    it('includes only public calendars', function () {
        $user = User::factory()->create();
        $publicCalendar = Calendar::factory()->create([
            'is_private' => false,
            'user_id' => $user->id,
        ]);
        $privateCalendar = Calendar::factory()->create([
            'is_private' => true,
            'user_id' => $user->id,
        ]);

        $response = $this->get('/sitemap-calendars.xml');

        $response->assertOk();
        $response->assertSee("/calendars/{$publicCalendar->id}", false);
        $response->assertDontSee("/calendars/{$privateCalendar->id}", false);
    });
});

describe('community sitemap', function () {
    it('returns sitemap with community listing page', function () {
        $response = $this->get('/sitemap-community.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
        $response->assertSee('https://goeventcity.test/community', false);
    });

    it('includes only active communities', function () {
        $workspace = Workspace::factory()->create();
        $user = User::factory()->create();
        $activeCommunity = Community::factory()->create([
            'is_active' => true,
            'workspace_id' => $workspace->id,
            'created_by' => $user->id,
        ]);
        $inactiveCommunity = Community::factory()->create([
            'is_active' => false,
            'workspace_id' => $workspace->id,
            'created_by' => $user->id,
        ]);

        $response = $this->get('/sitemap-community.xml');

        $response->assertOk();
        $response->assertSee("/community/{$activeCommunity->id}", false);
        $response->assertDontSee("/community/{$inactiveCommunity->id}", false);
    });
});

describe('pagination', function () {
    it('handles paginated events sitemap', function () {
        $response = $this->get('/sitemap-events-1.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
    });

    it('handles paginated venues sitemap', function () {
        $response = $this->get('/sitemap-venues-1.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
    });

    it('handles paginated performers sitemap', function () {
        $response = $this->get('/sitemap-performers-1.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
    });
});

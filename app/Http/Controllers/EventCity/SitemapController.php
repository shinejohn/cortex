<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Models\Calendar;
use App\Models\Community;
use App\Models\Event;
use App\Models\Performer;
use App\Models\Venue;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\SitemapIndex;
use Spatie\Sitemap\Tags\Sitemap as SitemapTag;
use Spatie\Sitemap\Tags\Url;

final class SitemapController extends Controller
{
    public function robots(): Response
    {
        $baseUrl = 'https://'.config('domains.event-city');
        $content = "User-agent: *\nAllow: /\n\nSitemap: {$baseUrl}/sitemap.xml\n";

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }

    public function index(): Response
    {
        $cacheKey = 'sitemap:event-city:index';

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () {
            $sitemapIndex = SitemapIndex::create();
            $baseUrl = 'https://'.config('domains.event-city');

            // Add static sitemap
            $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-static.xml"));

            // Add events sitemap(s)
            $eventCount = Event::published()->count();
            $eventPages = (int) ceil($eventCount / $this->getPerPage());
            if ($eventPages <= 1) {
                $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-events.xml"));
            } else {
                for ($i = 1; $i <= $eventPages; $i++) {
                    $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-events-{$i}.xml"));
                }
            }

            // Add venues sitemap(s)
            $venueCount = Venue::active()->count();
            $venuePages = (int) ceil($venueCount / $this->getPerPage());
            if ($venuePages <= 1) {
                $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-venues.xml"));
            } else {
                for ($i = 1; $i <= $venuePages; $i++) {
                    $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-venues-{$i}.xml"));
                }
            }

            // Add performers sitemap(s)
            $performerCount = Performer::active()->count();
            $performerPages = (int) ceil($performerCount / $this->getPerPage());
            if ($performerPages <= 1) {
                $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-performers.xml"));
            } else {
                for ($i = 1; $i <= $performerPages; $i++) {
                    $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-performers-{$i}.xml"));
                }
            }

            // Add calendars sitemap
            $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-calendars.xml"));

            // Add community sitemap
            $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-community.xml"));

            return $sitemapIndex->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    public function events(?int $page = null): Response
    {
        $cacheKey = 'sitemap:event-city:events'.($page ? ":{$page}" : '');

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () use ($page) {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.event-city');
            $perPage = $this->getPerPage();

            $query = Event::published()
                ->orderBy('updated_at', 'desc');

            if ($page !== null) {
                $query->offset(($page - 1) * $perPage)->limit($perPage);
            }

            $events = $query->get();

            foreach ($events as $event) {
                $sitemap->add(
                    Url::create("{$baseUrl}/events/{$event->id}")
                        ->setLastModificationDate($event->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                        ->setPriority(0.8)
                );
            }

            return $sitemap->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    public function venues(?int $page = null): Response
    {
        $cacheKey = 'sitemap:event-city:venues'.($page ? ":{$page}" : '');

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () use ($page) {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.event-city');
            $perPage = $this->getPerPage();

            $query = Venue::active()
                ->orderBy('updated_at', 'desc');

            if ($page !== null) {
                $query->offset(($page - 1) * $perPage)->limit($perPage);
            }

            $venues = $query->get();

            foreach ($venues as $venue) {
                $sitemap->add(
                    Url::create("{$baseUrl}/venues/{$venue->id}")
                        ->setLastModificationDate($venue->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                        ->setPriority(0.7)
                );
            }

            return $sitemap->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    public function performers(?int $page = null): Response
    {
        $cacheKey = 'sitemap:event-city:performers'.($page ? ":{$page}" : '');

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () use ($page) {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.event-city');
            $perPage = $this->getPerPage();

            $query = Performer::active()
                ->orderBy('updated_at', 'desc');

            if ($page !== null) {
                $query->offset(($page - 1) * $perPage)->limit($perPage);
            }

            $performers = $query->get();

            foreach ($performers as $performer) {
                $sitemap->add(
                    Url::create("{$baseUrl}/performers/{$performer->id}")
                        ->setLastModificationDate($performer->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                        ->setPriority(0.7)
                );
            }

            return $sitemap->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    public function calendars(): Response
    {
        $cacheKey = 'sitemap:event-city:calendars';

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.event-city');

            $calendars = Calendar::public()
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($calendars as $calendar) {
                $sitemap->add(
                    Url::create("{$baseUrl}/calendars/{$calendar->id}")
                        ->setLastModificationDate($calendar->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                        ->setPriority(0.6)
                );
            }

            return $sitemap->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    public function community(): Response
    {
        $cacheKey = 'sitemap:event-city:community';

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.event-city');

            // Add main community listing page
            $sitemap->add(
                Url::create("{$baseUrl}/community")
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                    ->setPriority(0.7)
            );

            // Add individual community pages
            $communities = Community::active()
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($communities as $communityItem) {
                $sitemap->add(
                    Url::create("{$baseUrl}/community/{$communityItem->id}")
                        ->setLastModificationDate($communityItem->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                        ->setPriority(0.6)
                );
            }

            return $sitemap->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    public function static(): Response
    {
        $cacheKey = 'sitemap:event-city:static';

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.event-city');

            // Homepage
            $sitemap->add(
                Url::create($baseUrl)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                    ->setPriority(1.0)
            );

            // Events listing
            $sitemap->add(
                Url::create("{$baseUrl}/events")
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                    ->setPriority(0.9)
            );

            // Venues listing
            $sitemap->add(
                Url::create("{$baseUrl}/venues")
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.8)
            );

            // Performers listing
            $sitemap->add(
                Url::create("{$baseUrl}/performers")
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.8)
            );

            // Calendars listing
            $sitemap->add(
                Url::create("{$baseUrl}/calendars")
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.7)
            );

            // Tickets
            $sitemap->add(
                Url::create("{$baseUrl}/tickets")
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                    ->setPriority(0.7)
            );

            return $sitemap->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    private function getCacheTtl(): int
    {
        return config('sitemap.cache_ttl', 21600);
    }

    private function getPerPage(): int
    {
        return config('sitemap.per_page', 50000);
    }

    private function getBaseUrl(): string
    {
        return mb_rtrim(config('app.url'), '/');
    }
}

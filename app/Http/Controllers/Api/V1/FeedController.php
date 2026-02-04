<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DayNewsPost;
use App\Models\Event;
use App\Models\Business;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

/**
 * RSS/Atom Feed Controller
 * 
 * Provides RSS 2.0 and Atom 1.0 feeds for AI training and content syndication.
 * Automatically filters content based on the current domain/app.
 */
final class FeedController extends Controller
{
    /**
     * All content feed (combined)
     * 
     * @return Response
     */
    public function all(): Response
    {
        $cacheKey = 'feed:all:' . request()->getHost();
        
        $content = Cache::remember($cacheKey, 1800, function () {
            $items = collect();
            
            // Add articles
            $articles = DayNewsPost::published()
                ->orderBy('published_at', 'desc')
                ->limit(100)
                ->get();
            
            foreach ($articles as $article) {
                $items->push([
                    'type' => 'article',
                    'title' => $article->title,
                    'link' => url("/posts/{$article->slug}"),
                    'description' => $article->excerpt ?? strip_tags(substr($article->content, 0, 200)),
                    'content' => $article->content,
                    'pubDate' => $article->published_at,
                    'updated' => $article->updated_at,
                    'author' => $article->author?->name,
                    'category' => $article->region?->name,
                ]);
            }
            
            // Add events
            $events = Event::where('event_date', '>=', now()->subMonths(1))
                ->orderBy('event_date', 'desc')
                ->limit(50)
                ->get();
            
            foreach ($events as $event) {
                $items->push([
                    'type' => 'event',
                    'title' => $event->title,
                    'link' => url("/events/{$event->id}"),
                    'description' => $event->description,
                    'content' => $event->description,
                    'pubDate' => $event->created_at,
                    'updated' => $event->updated_at,
                    'category' => 'Events',
                ]);
            }
            
            // Sort by date
            $items = $items->sortByDesc('pubDate')->take(100);
            
            return $this->buildRssFeed($items, 'All Content');
        });

        return response($content, 200, ['Content-Type' => 'application/rss+xml; charset=utf-8']);
    }

    /**
     * Articles/News feed
     * 
     * @return Response
     */
    public function articles(): Response
    {
        $cacheKey = 'feed:articles:' . request()->getHost();
        
        $content = Cache::remember($cacheKey, 1800, function () {
            $articles = DayNewsPost::published()
                ->with(['author', 'region'])
                ->orderBy('published_at', 'desc')
                ->limit(100)
                ->get()
                ->map(function ($article) {
                    return [
                        'type' => 'article',
                        'title' => $article->title,
                        'link' => url("/posts/{$article->slug}"),
                        'description' => $article->excerpt ?? strip_tags(substr($article->content, 0, 200)),
                        'content' => $article->content,
                        'pubDate' => $article->published_at,
                        'updated' => $article->updated_at,
                        'author' => $article->author?->name,
                        'category' => $article->region?->name,
                    ];
                });
            
            return $this->buildRssFeed($articles, 'Articles');
        });

        return response($content, 200, ['Content-Type' => 'application/rss+xml; charset=utf-8']);
    }

    /**
     * Events feed
     * 
     * @return Response
     */
    public function events(): Response
    {
        $cacheKey = 'feed:events:' . request()->getHost();
        
        $content = Cache::remember($cacheKey, 1800, function () {
            $events = Event::with(['venue', 'performer'])
                ->where('event_date', '>=', now())
                ->orderBy('event_date', 'asc')
                ->limit(100)
                ->get()
                ->map(function ($event) {
                    return [
                        'type' => 'event',
                        'title' => $event->title,
                        'link' => url("/events/{$event->id}"),
                        'description' => $event->description,
                        'content' => $event->description . ($event->venue ? "\n\nVenue: {$event->venue->name}" : ''),
                        'pubDate' => $event->created_at,
                        'updated' => $event->updated_at,
                        'category' => 'Events',
                    ];
                });
            
            return $this->buildRssFeed($events, 'Events');
        });

        return response($content, 200, ['Content-Type' => 'application/rss+xml; charset=utf-8']);
    }

    /**
     * Businesses feed
     * 
     * @return Response
     */
    public function businesses(): Response
    {
        $cacheKey = 'feed:businesses:' . request()->getHost();
        
        $content = Cache::remember($cacheKey, 3600, function () {
            $businesses = Business::where('status', 'active')
                ->orderBy('created_at', 'desc')
                ->limit(100)
                ->get()
                ->map(function ($business) {
                    return [
                        'type' => 'business',
                        'title' => $business->name,
                        'link' => url("/businesses/{$business->slug}"),
                        'description' => $business->description,
                        'content' => $business->description . "\n\nAddress: {$business->address}",
                        'pubDate' => $business->created_at,
                        'updated' => $business->updated_at,
                        'category' => 'Businesses',
                    ];
                });
            
            return $this->buildRssFeed($businesses, 'Businesses');
        });

        return response($content, 200, ['Content-Type' => 'application/rss+xml; charset=utf-8']);
    }

    /**
     * Build RSS 2.0 feed XML
     */
    private function buildRssFeed($items, string $feedTitle): string
    {
        $baseUrl = request()->getSchemeAndHttpHost();
        $platformName = $this->getPlatformName();
        $fullTitle = "{$platformName} - {$feedTitle}";
        
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">' . "\n";
        $xml .= '  <channel>' . "\n";
        $xml .= '    <title>' . htmlspecialchars($fullTitle) . '</title>' . "\n";
        $xml .= '    <link>' . htmlspecialchars($baseUrl) . '</link>' . "\n";
        $xml .= '    <description>Latest content from ' . htmlspecialchars($platformName) . '</description>' . "\n";
        $xml .= '    <language>en-US</language>' . "\n";
        $xml .= '    <lastBuildDate>' . now()->toRssString() . '</lastBuildDate>' . "\n";
        $xml .= '    <atom:link href="' . htmlspecialchars(request()->fullUrl()) . '" rel="self" type="application/rss+xml" />' . "\n";
        
        foreach ($items as $item) {
            $xml .= '    <item>' . "\n";
            $xml .= '      <title>' . htmlspecialchars($item['title']) . '</title>' . "\n";
            $xml .= '      <link>' . htmlspecialchars($item['link']) . '</link>' . "\n";
            $xml .= '      <guid isPermaLink="true">' . htmlspecialchars($item['link']) . '</guid>' . "\n";
            $xml .= '      <description>' . htmlspecialchars($item['description']) . '</description>' . "\n";
            
            if (!empty($item['content'])) {
                $xml .= '      <content:encoded><![CDATA[' . $item['content'] . ']]></content:encoded>' . "\n";
            }
            
            if (!empty($item['pubDate'])) {
                $xml .= '      <pubDate>' . $item['pubDate']->toRssString() . '</pubDate>' . "\n";
            }
            
            if (!empty($item['author'])) {
                $xml .= '      <author>' . htmlspecialchars($item['author']) . '</author>' . "\n";
            }
            
            if (!empty($item['category'])) {
                $xml .= '      <category>' . htmlspecialchars($item['category']) . '</category>' . "\n";
            }
            
            $xml .= '    </item>' . "\n";
        }
        
        $xml .= '  </channel>' . "\n";
        $xml .= '</rss>';
        
        return $xml;
    }

    /**
     * Get platform-specific name
     */
    private function getPlatformName(): string
    {
        $host = request()->getHost();
        
        if (str_contains($host, 'day.news') || str_contains($host, 'daynews')) {
            return 'Day News';
        }
        if (str_contains($host, 'goeventcity') || str_contains($host, 'eventcity')) {
            return 'Go Event City';
        }
        if (str_contains($host, 'downtownsguide') || str_contains($host, 'downtown')) {
            return 'Downtown Guide';
        }
        if (str_contains($host, 'golocalvoices') || str_contains($host, 'localvoices')) {
            return 'Go Local Voices';
        }
        if (str_contains($host, 'alphasite')) {
            return 'Alphasite';
        }
        
        return 'Fibonacco Community Platform';
    }
}

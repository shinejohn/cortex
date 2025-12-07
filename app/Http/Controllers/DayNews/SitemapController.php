<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\DayNewsPost;
use App\Models\Region;
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
        $baseUrl = 'https://'.config('domains.day-news');
        $content = "User-agent: *\nAllow: /\n\nSitemap: {$baseUrl}/sitemap.xml\n";

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }

    public function index(): Response
    {
        $cacheKey = 'sitemap:day-news:index';

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () {
            $sitemapIndex = SitemapIndex::create();
            $baseUrl = 'https://'.config('domains.day-news');

            // Add static sitemap
            $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-static.xml"));

            // Add regions sitemap
            $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-regions.xml"));

            // Add posts sitemap(s)
            $postCount = DayNewsPost::published()->count();
            $postPages = (int) ceil($postCount / $this->getPerPage());

            if ($postPages <= 1) {
                $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-posts.xml"));
            } else {
                for ($i = 1; $i <= $postPages; $i++) {
                    $sitemapIndex->add(SitemapTag::create("{$baseUrl}/sitemap-posts-{$i}.xml"));
                }
            }

            return $sitemapIndex->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    public function posts(?int $page = null): Response
    {
        $cacheKey = 'sitemap:day-news:posts'.($page ? ":{$page}" : '');

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () use ($page) {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.day-news');
            $perPage = $this->getPerPage();

            $query = DayNewsPost::published()
                ->orderBy('published_at', 'desc');

            if ($page !== null) {
                $query->offset(($page - 1) * $perPage)->limit($perPage);
            }

            $posts = $query->get();

            foreach ($posts as $post) {
                $sitemap->add(
                    Url::create("{$baseUrl}/posts/{$post->slug}")
                        ->setLastModificationDate($post->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                        ->setPriority(0.8)
                );
            }

            return $sitemap->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    public function static(): Response
    {
        $cacheKey = 'sitemap:day-news:static';

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.day-news');

            // Homepage
            $sitemap->add(
                Url::create($baseUrl)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                    ->setPriority(1.0)
            );

            return $sitemap->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    public function regions(): Response
    {
        $cacheKey = 'sitemap:day-news:regions';

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.day-news');

            $regions = Region::active()
                ->orderBy('type', 'desc')
                ->orderBy('name')
                ->get();

            foreach ($regions as $region) {
                $sitemap->add(
                    Url::create("{$baseUrl}/{$region->slug}")
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                        ->setPriority(0.9)
                );
            }

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
}

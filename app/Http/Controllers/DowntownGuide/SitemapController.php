<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

final class SitemapController extends Controller
{
    public function robots(): Response
    {
        $baseUrl = 'https://'.config('domains.downtown-guide');
        $content = "User-agent: *\nAllow: /\n\nSitemap: {$baseUrl}/sitemap.xml\n";

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }

    public function index(): Response
    {
        $cacheKey = 'sitemap:downtown-guide:index';

        $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () {
            $sitemap = Sitemap::create();
            $baseUrl = 'https://'.config('domains.downtown-guide');

            // Homepage (coming soon page)
            $sitemap->add(
                Url::create($baseUrl)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(1.0)
            );

            return $sitemap->render();
        });

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    private function getCacheTtl(): int
    {
        return config('sitemap.cache_ttl', 21600);
    }
}

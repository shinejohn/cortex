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
        $domain = config('domains.downtown-guide');
        if (!$domain) {
            $domain = request()->getHost();
        }
        $baseUrl = 'https://'.$domain;
        $content = "User-agent: *\nAllow: /\n\nSitemap: {$baseUrl}/sitemap.xml\n";

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }

    public function index(): Response
    {
        $cacheKey = 'sitemap:downtown-guide:index';

        try {
            // Try to use default cache (may be Redis)
            $content = Cache::remember($cacheKey, $this->getCacheTtl(), function () {
                return $this->generateSitemap();
            });
        } catch (\Throwable $e) {
            // If cache fails (e.g., Redis unavailable), try database cache as fallback
            \Illuminate\Support\Facades\Log::warning('Cache failed for sitemap, using database fallback', [
                'error' => $e->getMessage(),
            ]);
            
            try {
                $content = Cache::store('database')->remember($cacheKey, $this->getCacheTtl(), function () {
                    return $this->generateSitemap();
                });
            } catch (\Throwable $e2) {
                // If database cache also fails, generate without caching
                \Illuminate\Support\Facades\Log::error('Database cache also failed, generating sitemap without cache', [
                    'error' => $e2->getMessage(),
                ]);
                $content = $this->generateSitemap();
            }
        }

        return response($content, 200, ['Content-Type' => 'application/xml']);
    }

    private function generateSitemap(): string
    {
        $sitemap = Sitemap::create();
        $domain = config('domains.downtown-guide');
        if (!$domain) {
            $domain = request()->getHost();
        }
        $baseUrl = 'https://'.$domain;

        // Homepage (coming soon page)
        $sitemap->add(
            Url::create($baseUrl)
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                ->setPriority(1.0)
        );

        return $sitemap->render();
    }

    private function getCacheTtl(): int
    {
        return config('sitemap.cache_ttl', 21600);
    }
}

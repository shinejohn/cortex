<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\AlphasiteCategory;
use App\Models\Business;
use App\Models\City;
use App\Models\County;
use Illuminate\Http\Response;

final class SitemapController extends Controller
{
    /**
     * Generate XML sitemap with all active businesses.
     */
    public function index(): Response
    {
        $domain = config('alphasite.domain', 'alphasite.com');
        $businesses = Business::query()
            ->active()
            ->select(['slug', 'updated_at'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        // Homepage
        $xml .= '  <url>'."\n";
        $xml .= '    <loc>https://'.$domain.'</loc>'."\n";
        $xml .= '    <changefreq>daily</changefreq>'."\n";
        $xml .= '    <priority>1.0</priority>'."\n";
        $xml .= '  </url>'."\n";

        // Business pages
        foreach ($businesses as $business) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>https://'.$domain.'/business/'.$business->slug.'</loc>'."\n";
            $xml .= '    <lastmod>'.$business->updated_at->toW3cString().'</lastmod>'."\n";
            $xml .= '    <changefreq>weekly</changefreq>'."\n";
            $xml .= '    <priority>0.8</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    /**
     * Generate sitemap index for large sites (>50K URLs).
     */
    public function sitemapIndex(): Response
    {
        $domain = config('alphasite.domain', 'alphasite.com');
        $totalBusinesses = Business::active()->count();
        $perSitemap = 50000;
        $totalSitemaps = (int) ceil($totalBusinesses / $perSitemap);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        for ($i = 1; $i <= max($totalSitemaps, 1); $i++) {
            $xml .= '  <sitemap>'."\n";
            $xml .= '    <loc>https://'.$domain.'/sitemap.xml?page='.$i.'</loc>'."\n";
            $xml .= '    <lastmod>'.now()->toW3cString().'</lastmod>'."\n";
            $xml .= '  </sitemap>'."\n";
        }

        // Community sitemaps
        $xml .= '  <sitemap>'."\n";
        $xml .= '    <loc>https://'.$domain.'/sitemap-cities.xml</loc>'."\n";
        $xml .= '    <lastmod>'.now()->toW3cString().'</lastmod>'."\n";
        $xml .= '  </sitemap>'."\n";

        $xml .= '  <sitemap>'."\n";
        $xml .= '    <loc>https://'.$domain.'/sitemap-counties.xml</loc>'."\n";
        $xml .= '    <lastmod>'.now()->toW3cString().'</lastmod>'."\n";
        $xml .= '  </sitemap>'."\n";

        $xml .= '  <sitemap>'."\n";
        $xml .= '    <loc>https://'.$domain.'/sitemap-categories.xml</loc>'."\n";
        $xml .= '    <lastmod>'.now()->toW3cString().'</lastmod>'."\n";
        $xml .= '  </sitemap>'."\n";

        $xml .= '</sitemapindex>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    /**
     * City pages sitemap.
     */
    public function cities(): Response
    {
        $domain = config('alphasite.domain', 'alphasite.com');
        $cities = City::active()
            ->select(['slug', 'state', 'updated_at'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        // State pages (unique states)
        $states = $cities->pluck('state')->unique();
        foreach ($states as $state) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>https://'.$domain.'/state/'.$state.'</loc>'."\n";
            $xml .= '    <changefreq>weekly</changefreq>'."\n";
            $xml .= '    <priority>0.7</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        // City pages
        foreach ($cities as $city) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>https://'.$domain.'/city/'.$city->slug.'</loc>'."\n";
            $xml .= '    <lastmod>'.$city->updated_at->toW3cString().'</lastmod>'."\n";
            $xml .= '    <changefreq>weekly</changefreq>'."\n";
            $xml .= '    <priority>0.7</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    /**
     * County pages sitemap.
     */
    public function counties(): Response
    {
        $domain = config('alphasite.domain', 'alphasite.com');
        $counties = County::active()
            ->select(['slug', 'updated_at'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($counties as $county) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>https://'.$domain.'/county/'.$county->slug.'</loc>'."\n";
            $xml .= '    <lastmod>'.$county->updated_at->toW3cString().'</lastmod>'."\n";
            $xml .= '    <changefreq>weekly</changefreq>'."\n";
            $xml .= '    <priority>0.6</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    /**
     * Category pages sitemap (city+category combinations).
     */
    public function categories(): Response
    {
        $domain = config('alphasite.domain', 'alphasite.com');
        $categories = AlphasiteCategory::where('is_active', true)
            ->select(['slug'])
            ->get();
        $cities = City::active()
            ->select(['slug'])
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($cities as $city) {
            foreach ($categories as $category) {
                $xml .= '  <url>'."\n";
                $xml .= '    <loc>https://'.$domain.'/city/'.$city->slug.'/'.$category->slug.'</loc>'."\n";
                $xml .= '    <changefreq>weekly</changefreq>'."\n";
                $xml .= '    <priority>0.6</priority>'."\n";
                $xml .= '  </url>'."\n";
            }
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}

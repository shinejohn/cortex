<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\AlphasiteCategory;
use App\Models\County;
use App\Services\AlphaSite\BusinessQueryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CountyPageController extends Controller
{
    public function __construct(
        private readonly BusinessQueryService $businessQueryService
    ) {}

    /**
     * County landing page.
     */
    public function show(Request $request, string $slug): Response
    {
        $county = County::where('slug', $slug)
            ->active()
            ->firstOrFail();

        // Cities in this county with business counts
        $cities = $county->cities()
            ->active()
            ->withCount('businesses')
            ->orderBy('name')
            ->get();

        // Categories across the county
        $categories = $this->getCategoriesForCounty($county);

        $totalBusinessCount = $county->getActiveBusinesses()->count();

        $domain = config('alphasite.domain', 'alphasite.com');
        $canonicalUrl = "https://{$domain}/county/{$county->slug}";

        $breadcrumb = [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => 'Home',
                    'item' => "https://{$domain}",
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 2,
                    'name' => $county->state_full ?? $county->state,
                    'item' => "https://{$domain}/state/{$county->state}",
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 3,
                    'name' => "{$county->name} County",
                    'item' => $canonicalUrl,
                ],
            ],
        ];

        $seo = [
            'title' => "Businesses in {$county->name} County, {$county->state_full} | AlphaSite",
            'description' => mb_substr(
                $county->seo_description
                    ?? "Browse {$totalBusinessCount} local businesses across {$county->name} County, {$county->state}. Find top-rated service providers in {$cities->count()} cities.",
                0,
                160
            ),
            'canonical' => $canonicalUrl,
            'og' => [
                'title' => "Businesses in {$county->name} County, {$county->state_full}",
                'description' => "Browse local businesses across {$county->name} County, {$county->state}.",
                'type' => 'website',
                'url' => $canonicalUrl,
                'site_name' => 'AlphaSite',
            ],
        ];

        return Inertia::render('alphasite/county/show', [
            'county' => $county,
            'cities' => $cities,
            'categories' => $categories,
            'totalBusinessCount' => $totalBusinessCount,
            'schemas' => [
                'breadcrumb' => $breadcrumb,
            ],
            'seo' => $seo,
        ]);
    }

    /**
     * County + Category page.
     */
    public function showCategory(Request $request, string $countySlug, string $categorySlug): Response
    {
        $county = County::where('slug', $countySlug)
            ->active()
            ->firstOrFail();

        $category = AlphasiteCategory::where('slug', $categorySlug)
            ->active()
            ->firstOrFail();

        // Businesses grouped by city
        $businessesQuery = $county->getActiveBusinesses($category->id);
        $businesses = $businessesQuery
            ->with(['alphasiteCategory', 'industry', 'cityRecord'])
            ->orderByDesc('rating')
            ->orderBy('name')
            ->get();

        $businessesByCity = $businesses->groupBy(fn ($business) => $business->cityRecord?->name ?? $business->city ?? 'Other');

        // Cities in county for navigation
        $cities = $county->cities()
            ->active()
            ->orderBy('name')
            ->get();

        $domain = config('alphasite.domain', 'alphasite.com');
        $canonicalUrl = "https://{$domain}/county/{$county->slug}/{$category->slug}";

        $breadcrumb = [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => 'Home',
                    'item' => "https://{$domain}",
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 2,
                    'name' => $county->state_full ?? $county->state,
                    'item' => "https://{$domain}/state/{$county->state}",
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 3,
                    'name' => "{$county->name} County",
                    'item' => "https://{$domain}/county/{$county->slug}",
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 4,
                    'name' => $category->name,
                    'item' => $canonicalUrl,
                ],
            ],
        ];

        $seo = [
            'title' => "{$category->name} in {$county->name} County, {$county->state_full} | AlphaSite",
            'description' => mb_substr(
                "Find {$category->name} across {$county->name} County, {$county->state}. Browse {$businesses->count()} listings in {$businessesByCity->count()} cities.",
                0,
                160
            ),
            'canonical' => $canonicalUrl,
            'og' => [
                'title' => "{$category->name} in {$county->name} County, {$county->state_full}",
                'description' => "Find {$category->name} across {$county->name} County, {$county->state}.",
                'type' => 'website',
                'url' => $canonicalUrl,
                'site_name' => 'AlphaSite',
            ],
        ];

        return Inertia::render('alphasite/county/category', [
            'county' => $county,
            'category' => $category,
            'businesses' => $businesses,
            'businessesByCity' => $businessesByCity,
            'cities' => $cities,
            'totalBusinessCount' => $businesses->count(),
            'schemas' => [
                'breadcrumb' => $breadcrumb,
            ],
            'seo' => $seo,
        ]);
    }

    /**
     * Get categories with business counts for a county.
     *
     * @return array<int, array{id: string, name: string, slug: string, icon: ?string, business_count: int}>
     */
    private function getCategoriesForCounty(County $county): array
    {
        $categories = AlphasiteCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $results = [];

        foreach ($categories as $category) {
            $count = $county->getActiveBusinesses($category->id)->count();

            if ($count > 0) {
                $results[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'icon' => $category->icon,
                    'business_count' => $count,
                ];
            }
        }

        return $results;
    }
}

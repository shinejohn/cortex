<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\City;
use App\Services\AlphaSite\BusinessQueryService;
use App\Services\AlphaSite\CommunityContentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CityPageController extends Controller
{
    public function __construct(
        private readonly CommunityContentService $contentService,
        private readonly BusinessQueryService $businessQueryService
    ) {}

    /**
     * City landing page.
     */
    public function show(Request $request, string $slug): Response
    {
        $city = City::where('slug', $slug)
            ->active()
            ->firstOrFail();

        // Ensure AI content is generated
        $this->contentService->generateCityContent($city);
        $city->refresh();

        // Categories with business counts (includes service-area businesses)
        $categories = $this->businessQueryService->categoriesWithCountsForCity($city->id);

        // Featured businesses — top 12 by rating
        $featuredBusinesses = $this->businessQueryService->businessesServingCity($city->id)
            ->with(['alphasiteCategory', 'industry'])
            ->orderByDesc('rating')
            ->limit(12)
            ->get();

        // Neighboring cities (pivot relation first, fallback to nearby scope)
        $neighbors = $city->neighbors()->active()->limit(12)->get();

        if ($neighbors->isEmpty() && $city->latitude && $city->longitude) {
            $neighbors = City::active()
                ->where('id', '!=', $city->id)
                ->nearby((float) $city->latitude, (float) $city->longitude, 30)
                ->limit(12)
                ->get();
        }

        $totalBusinessCount = $this->businessQueryService->countBusinessesServingCity($city->id);

        $domain = config('alphasite.domain', 'alphasite.com');
        $canonicalUrl = "https://{$domain}/city/{$city->slug}";

        $schemas = $this->buildCitySchemas($city, $categories, $featuredBusinesses, $canonicalUrl);
        $seo = $this->buildCitySeo($city, $totalBusinessCount, $canonicalUrl);

        return Inertia::render('alphasite/city/show', [
            'city' => $city,
            'categories' => $categories,
            'featuredBusinesses' => $featuredBusinesses,
            'neighbors' => $neighbors,
            'totalBusinessCount' => $totalBusinessCount,
            'schemas' => $schemas,
            'seo' => $seo,
        ]);
    }

    /**
     * State page — all cities in a state.
     */
    public function showState(Request $request, string $state): Response
    {
        $state = mb_strtoupper($state);

        $cities = City::active()
            ->where('state', $state)
            ->withCount(['businesses'])
            ->orderBy('name')
            ->get();

        if ($cities->isEmpty()) {
            abort(404);
        }

        $stateFullName = $cities->first()->state_full ?? $state;

        $domain = config('alphasite.domain', 'alphasite.com');

        return Inertia::render('alphasite/state/show', [
            'state' => $state,
            'stateFullName' => $stateFullName,
            'cities' => $cities,
            'seo' => [
                'title' => "Business Directory - Cities in {$stateFullName}",
                'description' => "Browse local business directories across cities in {$stateFullName}. Find top-rated service providers, read reviews, and connect with businesses near you.",
                'canonical' => "https://{$domain}/state/{$state}",
                'og' => [
                    'title' => "Business Directory - Cities in {$stateFullName}",
                    'description' => "Browse local business directories across cities in {$stateFullName}.",
                    'type' => 'website',
                    'url' => "https://{$domain}/state/{$state}",
                    'site_name' => 'AlphaSite',
                ],
            ],
        ]);
    }

    /**
     * Build structured data schemas for the city page.
     *
     * @param  array<int, array{id: string, name: string, slug: string, icon: ?string, business_count: int}>  $categories
     * @return array{city: array, breadcrumb: array, itemList: array, faq: ?array}
     */
    private function buildCitySchemas(City $city, array $categories, mixed $featuredBusinesses, string $canonicalUrl): array
    {
        $domain = config('alphasite.domain', 'alphasite.com');

        $citySchema = [
            '@context' => 'https://schema.org',
            '@type' => 'City',
            'name' => $city->name,
            'url' => $canonicalUrl,
            'containedInPlace' => [
                '@type' => 'State',
                'name' => $city->state_full ?? $city->state,
            ],
        ];

        if ($city->latitude && $city->longitude) {
            $citySchema['geo'] = [
                '@type' => 'GeoCoordinates',
                'latitude' => (float) $city->latitude,
                'longitude' => (float) $city->longitude,
            ];
        }

        if ($city->population) {
            $citySchema['population'] = $city->population;
        }

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
                    'name' => $city->state_full ?? $city->state,
                    'item' => "https://{$domain}/state/{$city->state}",
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 3,
                    'name' => $city->name,
                    'item' => $canonicalUrl,
                ],
            ],
        ];

        $itemListElements = [];
        foreach ($featuredBusinesses->take(10) as $index => $business) {
            $itemListElements[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'item' => [
                    '@type' => 'LocalBusiness',
                    'name' => $business->name,
                    'url' => "https://{$domain}/business/{$business->slug}",
                    'address' => [
                        '@type' => 'PostalAddress',
                        'addressLocality' => $business->city,
                        'addressRegion' => $business->state,
                    ],
                ],
            ];
        }

        $itemList = [
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'name' => "Top Businesses in {$city->name}, {$city->state}",
            'numberOfItems' => count($itemListElements),
            'itemListElement' => $itemListElements,
        ];

        $faq = null;
        if (! empty($city->ai_faqs)) {
            $faqEntries = [];
            foreach ($city->ai_faqs as $faqItem) {
                if (isset($faqItem['question'], $faqItem['answer'])) {
                    $faqEntries[] = [
                        '@type' => 'Question',
                        'name' => $faqItem['question'],
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => $faqItem['answer'],
                        ],
                    ];
                }
            }

            if (! empty($faqEntries)) {
                $faq = [
                    '@context' => 'https://schema.org',
                    '@type' => 'FAQPage',
                    'mainEntity' => $faqEntries,
                ];
            }
        }

        return [
            'city' => $citySchema,
            'breadcrumb' => $breadcrumb,
            'itemList' => $itemList,
            'faq' => $faq,
        ];
    }

    /**
     * Build SEO meta for the city page.
     *
     * @return array{title: string, description: string, canonical: string, og: array}
     */
    private function buildCitySeo(City $city, int $totalBusinessCount, string $canonicalUrl): array
    {
        $title = "Best Local Businesses in {$city->name}, {$city->state_full} | AlphaSite";
        $description = $city->seo_description
            ?? "Find top-rated businesses in {$city->name}, {$city->state}. Browse {$totalBusinessCount} verified listings, read reviews, and connect with local service providers.";

        return [
            'title' => $title,
            'description' => mb_substr($description, 0, 160),
            'canonical' => $canonicalUrl,
            'og' => [
                'title' => $title,
                'description' => mb_substr($description, 0, 200),
                'type' => 'website',
                'url' => $canonicalUrl,
                'site_name' => 'AlphaSite',
                'locale' => 'en_US',
            ],
        ];
    }
}

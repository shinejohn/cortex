<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\AlphasiteCategory;
use App\Models\City;
use App\Services\AlphaSite\BusinessQueryService;
use App\Services\AlphaSite\CommunityContentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CityCategoryPageController extends Controller
{
    public function __construct(
        private readonly CommunityContentService $contentService,
        private readonly BusinessQueryService $businessQueryService
    ) {}

    /**
     * City + Category page.
     */
    public function show(Request $request, string $citySlug, string $categorySlug): Response
    {
        $city = City::where('slug', $citySlug)
            ->active()
            ->firstOrFail();

        $category = AlphasiteCategory::where('slug', $categorySlug)
            ->active()
            ->firstOrFail();

        // Get or generate content for this city+category pair
        $content = $this->contentService->generateCityCategoryContent($city, $category);

        // Businesses: home-city first, then service-area, ordered by rating
        $businesses = $this->businessQueryService->businessesForCityCategory($city->id, $category->id)
            ->with(['alphasiteCategory', 'industry'])
            ->paginate(24);

        // Related categories in the same city
        $relatedCategories = $category->relatedCategories()
            ->get()
            ->map(function (AlphasiteCategory $related) use ($city) {
                return [
                    'id' => $related->id,
                    'name' => $related->name,
                    'slug' => $related->slug,
                    'icon' => $related->icon,
                    'business_count' => $this->businessQueryService->countBusinessesServingCity($city->id, $related->id),
                ];
            })
            ->filter(fn (array $item) => $item['business_count'] > 0)
            ->values();

        // Same category in nearby cities
        $nearbyCities = collect();
        if ($city->latitude && $city->longitude) {
            $nearbyCities = City::active()
                ->where('id', '!=', $city->id)
                ->nearby((float) $city->latitude, (float) $city->longitude, 30)
                ->limit(10)
                ->get()
                ->filter(function (City $nearbyCity) use ($category) {
                    return $this->businessQueryService->countBusinessesServingCity($nearbyCity->id, $category->id) > 0;
                })
                ->map(function (City $nearbyCity) use ($category) {
                    return [
                        'id' => $nearbyCity->id,
                        'name' => $nearbyCity->name,
                        'state' => $nearbyCity->state,
                        'slug' => $nearbyCity->slug,
                        'distance_miles' => $nearbyCity->distance_miles ?? null,
                        'business_count' => $this->businessQueryService->countBusinessesServingCity($nearbyCity->id, $category->id),
                    ];
                })
                ->values();
        }

        // Other categories in this city
        $otherCategories = $this->businessQueryService->categoriesWithCountsForCity($city->id);
        $otherCategories = collect($otherCategories)
            ->filter(fn (array $cat) => $cat['id'] !== $category->id)
            ->values()
            ->toArray();

        $domain = config('alphasite.domain', 'alphasite.com');
        $canonicalUrl = "https://{$domain}/city/{$city->slug}/{$category->slug}";

        $schemas = $this->buildSchemas($city, $category, $content, $businesses, $canonicalUrl);
        $seo = $this->buildSeo($city, $category, $content, $canonicalUrl);

        return Inertia::render('alphasite/city/category', [
            'city' => $city,
            'category' => $category,
            'content' => $content,
            'businesses' => $businesses,
            'relatedCategories' => $relatedCategories,
            'nearbyCities' => $nearbyCities,
            'otherCategories' => $otherCategories,
            'schemas' => $schemas,
            'seo' => $seo,
        ]);
    }

    /**
     * Build structured data schemas for the city+category page.
     *
     * @return array{breadcrumb: array, itemList: array, faq: ?array}
     */
    private function buildSchemas(City $city, AlphasiteCategory $category, mixed $content, mixed $businesses, string $canonicalUrl): array
    {
        $domain = config('alphasite.domain', 'alphasite.com');

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
                    'item' => "https://{$domain}/city/{$city->slug}",
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 4,
                    'name' => $category->name,
                    'item' => $canonicalUrl,
                ],
            ],
        ];

        // ItemList with LocalBusiness items
        $itemListElements = [];
        foreach ($businesses->take(10) as $index => $business) {
            $listItem = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'item' => [
                    '@type' => 'LocalBusiness',
                    'name' => $business->name,
                    'url' => "https://{$domain}/business/{$business->slug}",
                    'address' => [
                        '@type' => 'PostalAddress',
                        'streetAddress' => $business->address,
                        'addressLocality' => $business->city,
                        'addressRegion' => $business->state,
                        'postalCode' => $business->postal_code,
                    ],
                ],
            ];

            if ($business->phone) {
                $listItem['item']['telephone'] = $business->phone;
            }

            if ($business->rating) {
                $listItem['item']['aggregateRating'] = [
                    '@type' => 'AggregateRating',
                    'ratingValue' => (float) $business->rating,
                    'reviewCount' => $business->reviews_count ?? 0,
                ];
            }

            $itemListElements[] = $listItem;
        }

        $itemList = [
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'name' => "{$category->name} in {$city->name}, {$city->state}",
            'numberOfItems' => $businesses->total(),
            'itemListElement' => $itemListElements,
        ];

        // FAQPage schema
        $faq = null;
        $faqData = $content->ai_faqs ?? [];
        if (! empty($faqData)) {
            $faqEntries = [];
            foreach ($faqData as $faqItem) {
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
            'breadcrumb' => $breadcrumb,
            'itemList' => $itemList,
            'faq' => $faq,
        ];
    }

    /**
     * Build SEO meta for the city+category page.
     *
     * @return array{title: string, description: string, canonical: string, og: array}
     */
    private function buildSeo(City $city, AlphasiteCategory $category, mixed $content, string $canonicalUrl): array
    {
        $title = $content->seo_title
            ?? "Best {$category->name} in {$city->name}, {$city->state_full} | AlphaSite";

        $description = $content->seo_description
            ?? "Find top-rated {$category->name} in {$city->name}, {$city->state}. Compare reviews, get quotes, and hire the best local {$category->name}.";

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

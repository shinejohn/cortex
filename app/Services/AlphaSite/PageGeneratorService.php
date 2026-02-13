<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Services\CacheService;
use App\Services\SeoService;

final class PageGeneratorService
{
    public function __construct(
        private readonly TemplateService $templateService,
        private readonly SeoService $seoService,
        private readonly CacheService $cacheService
    ) {}

    /**
     * Generate a complete AlphaSite page for a business with full schema and SEO.
     *
     * @return array{business: Business, template: mixed, seo: array, schemas: array, crossPlatform: array, tabs: array, aiServices: array, communityLinks: array}
     */
    public function generateBusinessPage(Business $business): array
    {
        $cacheKey = "alphasite:page:{$business->id}";

        return $this->cacheService->remember($cacheKey, 3600, function () use ($business) {
            $business->load([
                'industry',
                'reviews',
                'faqs',
                'coupons',
                'localVoices',
                'photoContributions',
                'subscription',
                'template',
            ]);

            $template = $this->templateService->getTemplateForBusiness($business);

            $schemas = $this->generateSchemas($business);
            $seoMeta = $this->generateSeoMeta($business);
            $crossPlatform = $this->getCrossPlatformContent($business);

            return [
                'business' => $business,
                'template' => $template,
                'seo' => $seoMeta,
                'schema' => $schemas['primary'],
                'schemas' => $schemas,
                'crossPlatform' => $crossPlatform,
                'tabs' => $this->getAvailableTabs($business, $template),
                'aiServices' => $this->getAIServicesConfig($business),
                'communityLinks' => $this->generateCommunityLinks($business),
            ];
        });
    }

    /**
     * Generate all JSON-LD schemas for the business page.
     *
     * @return array{primary: array, breadcrumb: array, aggregateRating: array|null, events: array, faq: array|null}
     */
    public function generateSchemas(Business $business): array
    {
        $events = $business->relatedContent('App\Models\Event')->get();

        return [
            'primary' => $this->buildLocalBusinessSchema($business),
            'breadcrumb' => $this->buildBreadcrumbSchema($business),
            'aggregateRating' => $this->buildAggregateRatingSchema($business),
            'events' => $events->map(fn ($relation) => $this->buildEventSchema($relation))->filter()->values()->all(),
            'faq' => $this->buildFAQSchema($business),
        ];
    }

    /**
     * Generate comprehensive SEO meta tags including OG, Twitter, and geo tags.
     *
     * @return array{title: string, description: string, keywords: string, canonical: string, og: array, twitter: array, geo: array}
     */
    public function generateSeoMeta(Business $business): array
    {
        $domain = config('alphasite.domain', 'alphasite.com');
        $url = $business->alphasite_subdomain
            ? "https://{$business->alphasite_subdomain}.{$domain}"
            : "https://{$domain}/business/{$business->slug}";

        $industryName = $business->industry?->name ?? 'Business';
        $title = "{$business->name} - {$industryName} in {$business->city}, {$business->state}";
        $description = $business->description
            ?? "{$business->name} is a {$industryName} located in {$business->city}, {$business->state}. Find services, reviews, and contact information.";
        $image = $business->images[0] ?? null;
        $keywords = $this->generateKeywords($business);

        return [
            'title' => $title,
            'description' => mb_substr($description, 0, 160),
            'keywords' => $keywords,
            'canonical' => $url,
            'og' => [
                'title' => $title,
                'description' => mb_substr($description, 0, 200),
                'type' => 'business.business',
                'url' => $url,
                'image' => $image,
                'site_name' => 'AlphaSite',
                'locale' => 'en_US',
            ],
            'twitter' => [
                'card' => $image ? 'summary_large_image' : 'summary',
                'title' => $title,
                'description' => mb_substr($description, 0, 200),
                'image' => $image,
            ],
            'geo' => [
                'position' => $business->latitude && $business->longitude
                    ? "{$business->latitude};{$business->longitude}"
                    : null,
                'placename' => "{$business->city}, {$business->state}",
                'region' => $business->state ? "US-{$business->state}" : null,
                'icbm' => $business->latitude && $business->longitude
                    ? "{$business->latitude}, {$business->longitude}"
                    : null,
            ],
        ];
    }

    /**
     * Gather cross-platform content: articles, events, coupons, local voices.
     *
     * @return array{articles: array, events: array, coupons: array, localVoices: array}
     */
    public function getCrossPlatformContent(Business $business): array
    {
        $articleRelations = $business->relatedContent('App\Models\DayNewsPost')->with('relatable')->limit(10)->get();
        $eventRelations = $business->relatedContent('App\Models\Event')->with('relatable')->limit(10)->get();

        $coupons = $business->relationLoaded('coupons')
            ? $business->coupons
            : $business->coupons()->get();

        $localVoices = $business->relationLoaded('localVoices')
            ? $business->localVoices
            : $business->localVoices()->get();

        return [
            'articles' => $articleRelations->map(fn ($r) => $r->relatable)->filter()->values()->all(),
            'events' => $eventRelations->map(fn ($r) => $r->relatable)->filter()->values()->all(),
            'coupons' => $coupons->toArray(),
            'localVoices' => $localVoices->toArray(),
        ];
    }

    /**
     * Build a full LocalBusiness JSON-LD schema with industry type mapping.
     */
    private function buildLocalBusinessSchema(Business $business): array
    {
        $domain = config('alphasite.domain', 'alphasite.com');
        $url = $business->alphasite_subdomain
            ? "https://{$business->alphasite_subdomain}.{$domain}"
            : "https://{$domain}/business/{$business->slug}";

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => $this->getSchemaType($business),
            '@id' => $url,
            'name' => $business->name,
            'description' => $business->description,
            'url' => $url,
            'telephone' => $business->phone,
            'email' => $business->email,
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $business->address,
                'addressLocality' => $business->city,
                'addressRegion' => $business->state,
                'postalCode' => $business->postal_code,
                'addressCountry' => $business->country ?? 'US',
            ],
        ];

        if ($business->latitude && $business->longitude) {
            $schema['geo'] = [
                '@type' => 'GeoCoordinates',
                'latitude' => (float) $business->latitude,
                'longitude' => (float) $business->longitude,
            ];
        }

        if ($business->website) {
            $schema['sameAs'] = [$business->website];
        }

        if ($business->images && count($business->images) > 0) {
            $schema['image'] = $business->images;
            $schema['logo'] = $business->images[0];
        }

        if ($business->price_level) {
            $schema['priceRange'] = str_repeat('$', min((int) $business->price_level, 4));
        }

        $openingHours = $this->formatOpeningHours($business->opening_hours);
        if (! empty($openingHours)) {
            $schema['openingHoursSpecification'] = $openingHours;
        }

        if ($business->rating) {
            $schema['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => (float) $business->rating,
                'reviewCount' => $business->reviews_count ?? 0,
            ];
        }

        return $schema;
    }

    /**
     * Build BreadcrumbList JSON-LD schema: Home > City > Industry > Business.
     */
    private function buildBreadcrumbSchema(Business $business): array
    {
        $domain = config('alphasite.domain', 'alphasite.com');

        $items = [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => 'Home',
                'item' => "https://{$domain}",
            ],
        ];

        if ($business->city) {
            $items[] = [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => $business->city,
                'item' => "https://{$domain}/city/".urlencode(mb_strtolower($business->city)),
            ];
        }

        if ($business->industry) {
            $items[] = [
                '@type' => 'ListItem',
                'position' => count($items) + 1,
                'name' => $business->industry->name,
                'item' => "https://{$domain}/industry/{$business->industry->slug}",
            ];
        }

        $items[] = [
            '@type' => 'ListItem',
            'position' => count($items) + 1,
            'name' => $business->name,
            'item' => $business->alphasite_subdomain
                ? "https://{$business->alphasite_subdomain}.{$domain}"
                : "https://{$domain}/business/{$business->slug}",
        ];

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $items,
        ];
    }

    /**
     * Build AggregateRating JSON-LD schema when reviews exist.
     */
    private function buildAggregateRatingSchema(Business $business): ?array
    {
        if (! $business->rating || ! $business->reviews_count || $business->reviews_count < 1) {
            return null;
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'AggregateRating',
            'itemReviewed' => [
                '@type' => $this->getSchemaType($business),
                'name' => $business->name,
            ],
            'ratingValue' => (float) $business->rating,
            'bestRating' => 5,
            'worstRating' => 1,
            'ratingCount' => $business->reviews_count,
            'reviewCount' => $business->reviews_count,
        ];
    }

    /**
     * Build an Event JSON-LD schema for a related event.
     */
    private function buildEventSchema(mixed $relation): ?array
    {
        $event = $relation->relatable ?? null;
        if (! $event) {
            return null;
        }

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Event',
            'name' => $event->name ?? $event->title ?? '',
            'description' => $event->description ?? '',
            'startDate' => $event->start_date ?? $event->starts_at ?? null,
            'endDate' => $event->end_date ?? $event->ends_at ?? $event->start_date ?? $event->starts_at ?? null,
        ];

        if (! empty($event->image)) {
            $schema['image'] = $event->image;
        }

        if (! empty($event->venue_name) || ! empty($event->address)) {
            $location = ['@type' => 'Place'];
            if (! empty($event->venue_name)) {
                $location['name'] = $event->venue_name;
            }
            if (! empty($event->address)) {
                $location['address'] = [
                    '@type' => 'PostalAddress',
                    'streetAddress' => $event->address,
                ];
            }
            $schema['location'] = $location;
        }

        $schema['eventStatus'] = 'https://schema.org/EventScheduled';
        $schema['eventAttendanceMode'] = 'https://schema.org/OfflineEventAttendanceMode';

        return $schema;
    }

    /**
     * Build FAQPage JSON-LD schema from business FAQs and auto-generated questions.
     */
    private function buildFAQSchema(Business $business): ?array
    {
        $faqEntries = [];

        // Auto-generate common FAQs from business data
        if ($business->opening_hours && count($business->opening_hours) > 0) {
            $faqEntries[] = [
                '@type' => 'Question',
                'name' => "What are the hours for {$business->name}?",
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $this->formatHoursAsText($business->opening_hours),
                ],
            ];
        }

        if ($business->phone) {
            $faqEntries[] = [
                '@type' => 'Question',
                'name' => "What is the phone number for {$business->name}?",
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => "You can reach {$business->name} at {$business->phone}.",
                ],
            ];
        }

        if ($business->description) {
            $faqEntries[] = [
                '@type' => 'Question',
                'name' => "What does {$business->name} do?",
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $business->description,
                ],
            ];
        }

        // Add business-defined FAQs
        $businessFaqs = $business->relationLoaded('faqs')
            ? $business->faqs->where('is_active', true)
            : $business->activeFaqs()->get();

        foreach ($businessFaqs as $faq) {
            $faqEntries[] = [
                '@type' => 'Question',
                'name' => $faq->question,
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $faq->answer,
                ],
            ];
        }

        if (empty($faqEntries)) {
            return null;
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $faqEntries,
        ];
    }

    /**
     * Convert opening_hours JSON to schema.org OpeningHoursSpecification format.
     *
     * @return array<int, array>
     */
    private function formatOpeningHours(?array $openingHours): array
    {
        if (empty($openingHours)) {
            return [];
        }

        $dayMap = [
            'monday' => 'Monday',
            'tuesday' => 'Tuesday',
            'wednesday' => 'Wednesday',
            'thursday' => 'Thursday',
            'friday' => 'Friday',
            'saturday' => 'Saturday',
            'sunday' => 'Sunday',
            'mon' => 'Monday',
            'tue' => 'Tuesday',
            'wed' => 'Wednesday',
            'thu' => 'Thursday',
            'fri' => 'Friday',
            'sat' => 'Saturday',
            'sun' => 'Sunday',
        ];

        $specs = [];

        foreach ($openingHours as $key => $value) {
            // Handle keyed format: ['Monday' => ['open' => '09:00', 'close' => '17:00']]
            if (is_string($key) && is_array($value)) {
                $dayName = $dayMap[mb_strtolower($key)] ?? ucfirst($key);
                $open = $value['open'] ?? $value['opens'] ?? null;
                $close = $value['close'] ?? $value['closes'] ?? null;

                if ($open && $close) {
                    $specs[] = [
                        '@type' => 'OpeningHoursSpecification',
                        'dayOfWeek' => "https://schema.org/{$dayName}",
                        'opens' => $open,
                        'closes' => $close,
                    ];
                }

                continue;
            }

            // Handle array-of-objects format: [['day' => 'Monday', 'open' => '09:00', 'close' => '17:00']]
            if (is_array($value)) {
                $day = $value['day'] ?? $value['dayOfWeek'] ?? null;
                $open = $value['open'] ?? $value['opens'] ?? null;
                $close = $value['close'] ?? $value['closes'] ?? null;

                if ($day && $open && $close) {
                    $dayName = $dayMap[mb_strtolower($day)] ?? ucfirst($day);
                    $specs[] = [
                        '@type' => 'OpeningHoursSpecification',
                        'dayOfWeek' => "https://schema.org/{$dayName}",
                        'opens' => $open,
                        'closes' => $close,
                    ];
                }
            }
        }

        return $specs;
    }

    /**
     * Format opening hours as a human-readable text string.
     */
    private function formatHoursAsText(?array $openingHours): string
    {
        if (empty($openingHours)) {
            return 'Hours not available.';
        }

        $lines = [];

        foreach ($openingHours as $key => $value) {
            if (is_string($key) && is_array($value)) {
                $open = $value['open'] ?? $value['opens'] ?? null;
                $close = $value['close'] ?? $value['closes'] ?? null;

                if ($open && $close) {
                    $lines[] = ucfirst($key).": {$open} - {$close}";
                } else {
                    $lines[] = ucfirst($key).': Closed';
                }

                continue;
            }

            if (is_array($value)) {
                $day = $value['day'] ?? $value['dayOfWeek'] ?? 'Unknown';
                $open = $value['open'] ?? $value['opens'] ?? null;
                $close = $value['close'] ?? $value['closes'] ?? null;

                if ($open && $close) {
                    $lines[] = ucfirst($day).": {$open} - {$close}";
                } else {
                    $lines[] = ucfirst($day).': Closed';
                }
            }
        }

        if (empty($lines)) {
            return 'Hours not available.';
        }

        return implode('. ', $lines).'.';
    }

    /**
     * Generate keywords from business attributes.
     */
    private function generateKeywords(Business $business): string
    {
        $keywords = [];

        $keywords[] = $business->name;

        if ($business->industry?->name) {
            $keywords[] = $business->industry->name;
        }

        if ($business->city) {
            $keywords[] = $business->city;
        }

        if ($business->state) {
            $keywords[] = $business->state;
        }

        if ($business->city && $business->state) {
            $keywords[] = "{$business->city} {$business->state}";
        }

        if ($business->categories && is_array($business->categories)) {
            foreach (array_slice($business->categories, 0, 5) as $category) {
                if (is_string($category)) {
                    $keywords[] = $category;
                }
            }
        }

        if ($business->industry?->slug) {
            $keywords[] = "{$business->industry->name} near me";
            $keywords[] = "{$business->industry->name} in {$business->city}";
        }

        return implode(', ', array_unique(array_filter($keywords)));
    }

    /**
     * Get schema.org type based on industry slug.
     */
    private function getSchemaType(Business $business): string
    {
        $schemaTypeMap = [
            'restaurant' => 'Restaurant',
            'retail' => 'Store',
            'healthcare' => 'MedicalBusiness',
            'legal' => 'LegalService',
            'automotive' => 'AutoRepair',
            'salon' => 'BeautySalon',
            'fitness' => 'HealthClub',
            'real-estate' => 'RealEstateAgent',
            'hotel' => 'Hotel',
            'education' => 'EducationalOrganization',
            'financial' => 'FinancialService',
        ];

        return $schemaTypeMap[$business->industry?->slug] ?? 'LocalBusiness';
    }

    /**
     * Get available tabs for this business.
     */
    private function getAvailableTabs(Business $business, mixed $template): array
    {
        $availableTabs = ['overview', 'reviews'];

        if ($business->images && count($business->images) > 0) {
            $availableTabs[] = 'photos';
        }

        if ($business->industry?->slug === 'restaurant') {
            $availableTabs[] = 'menu';
        }

        if ($business->relatedContent('App\Models\DayNewsPost')->count() > 0) {
            $availableTabs[] = 'articles';
        }

        if ($business->relatedContent('App\Models\Event')->count() > 0) {
            $availableTabs[] = 'events';
        }

        if ($business->relatedContent('App\Models\Coupon')->count() > 0) {
            $availableTabs[] = 'coupons';
        }

        if ($business->achievements()->count() > 0) {
            $availableTabs[] = 'achievements';
        }

        return $availableTabs;
    }

    /**
     * Get AI services configuration based on subscription tier.
     */
    private function getAIServicesConfig(Business $business): array
    {
        $subscription = $business->subscription;

        if (! $subscription || $subscription->tier === 'basic') {
            return [
                'enabled' => false,
                'services' => [],
            ];
        }

        $enabledServices = $subscription->ai_services_enabled ?? [];

        return [
            'enabled' => true,
            'services' => $enabledServices,
        ];
    }

    /**
     * Generate community cross-links for SEO and navigation.
     */
    private function generateCommunityLinks(Business $business): array
    {
        return [
            'downtownsguide' => [
                'url' => "https://downtownsguide.com/business/{$business->slug}",
                'label' => 'View on DowntownsGuide',
            ],
            'daynews' => [
                'url' => "https://day.news/{$business->city}/business/{$business->slug}",
                'label' => 'Read on Day.News',
            ],
            'goeventcity' => [
                'url' => "https://goeventcity.com/venue/{$business->slug}",
                'label' => 'Events on GoEventCity',
            ],
            'industry' => [
                'url' => "https://alphasite.com/industry/{$business->industry?->slug}",
                'label' => "All {$business->industry?->name}",
            ],
            'community' => [
                'url' => "https://alphasite.com/community/{$business->city}-{$business->state}",
                'label' => "Businesses in {$business->city}, {$business->state}",
            ],
        ];
    }
}

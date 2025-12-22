<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Services\SeoService;
use App\Services\CacheService;

final class PageGeneratorService
{
    public function __construct(
        private readonly TemplateService $templateService,
        private readonly SeoService $seoService,
        private readonly CacheService $cacheService
    ) {}

    /**
     * Generate a complete AlphaSite page for a business
     */
    public function generateBusinessPage(Business $business): array
    {
        $cacheKey = "alphasite:page:{$business->id}";
        
        return $this->cacheService->remember($cacheKey, 3600, function () use ($business) {
            // Get the appropriate template for this industry
            $template = $this->templateService->getTemplateForBusiness($business);
            
            // Generate SEO metadata
            $seoMetadata = SeoService::generateBusinessSeo($business);
            
            // Generate schema markup
            $schemaMarkup = $this->generateSchemaMarkup($business);
            
            return [
                'business' => $business,
                'template' => $template,
                'seo' => $seoMetadata,
                'schema' => $schemaMarkup,
                'tabs' => $this->getAvailableTabs($business, $template),
                'aiServices' => $this->getAIServicesConfig($business),
                'communityLinks' => $this->generateCommunityLinks($business),
            ];
        });
    }

    /**
     * Generate JSON-LD schema markup for SEO/AI optimization
     */
    private function generateSchemaMarkup(Business $business): array
    {
        $baseSchema = [
            '@context' => 'https://schema.org',
            '@type' => $this->getSchemaType($business),
            'name' => $business->name,
            'description' => $business->description,
            'url' => $business->alphasite_subdomain 
                ? "https://{$business->alphasite_subdomain}.alphasite.com"
                : "https://alphasite.com/business/{$business->slug}",
            'telephone' => $business->phone,
            'email' => $business->email,
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $business->address,
                'addressLocality' => $business->city,
                'addressRegion' => $business->state,
                'postalCode' => $business->postal_code,
                'addressCountry' => $business->country,
            ],
        ];

        if ($business->latitude && $business->longitude) {
            $baseSchema['geo'] = [
                '@type' => 'GeoCoordinates',
                'latitude' => $business->latitude,
                'longitude' => $business->longitude,
            ];
        }

        if ($business->rating) {
            $baseSchema['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => $business->rating,
                'reviewCount' => $business->reviews_count,
            ];
        }

        return $baseSchema;
    }

    /**
     * Get schema.org type based on industry
     */
    private function getSchemaType(Business $business): string
    {
        $schemaMap = [
            'restaurant' => 'Restaurant',
            'retail' => 'Store',
            'healthcare' => 'MedicalBusiness',
            'legal' => 'LegalService',
            'automotive' => 'AutoRepair',
            'salon' => 'BeautySalon',
            'fitness' => 'HealthClub',
            'real-estate' => 'RealEstateAgent',
        ];

        return $schemaMap[$business->industry?->slug] ?? 'LocalBusiness';
    }

    /**
     * Get available tabs for this business
     */
    private function getAvailableTabs(Business $business, $template): array
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
     * Get AI services configuration
     */
    private function getAIServicesConfig(Business $business): array
    {
        $subscription = $business->subscription;
        
        if (!$subscription || $subscription->tier === 'basic') {
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
     * Generate community cross-links for SEO
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


<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Services\OrganizationService;

/**
 * Handles cross-platform linking between AlphaSite and other Fibonacco properties
 */
final class LinkingService
{
    public function __construct(
        private readonly OrganizationService $organizationService
    ) {}

    /**
     * Get all cross-platform content for a business
     */
    public function getCrossPlatformContent(Business $business): array
    {
        return $this->organizationService->getOrganizationContent($business, [
            'App\Models\DayNewsPost',
            'App\Models\Event',
            'App\Models\Coupon',
        ]);
    }

    /**
     * Generate internal links for SEO
     */
    public function generateInternalLinks(Business $business): array
    {
        $links = [];
        
        // Link to community businesses
        $links['community'] = [
            'all_businesses' => "/community/{$business->city}-{$business->state}",
            'downtown_businesses' => "/community/{$business->city}-{$business->state}/downtown",
        ];
        
        // Link to industry pages
        if ($business->industry) {
            $links['industry'] = [
                'all_in_industry' => "/industry/{$business->industry->slug}",
                'local_in_industry' => "/industry/{$business->industry->slug}/{$business->city}-{$business->state}",
            ];
        }
        
        return $links;
    }

    /**
     * Generate backlinks to external Fibonacco properties
     */
    public function generateBacklinks(Business $business): array
    {
        return [
            'day_news' => [
                'business_profile' => "https://day.news/{$business->city}/directory/{$business->slug}",
                'local_section' => "https://day.news/{$business->city}",
            ],
            'goeventcity' => [
                'venue_profile' => "https://goeventcity.com/venue/{$business->slug}",
                'local_events' => "https://goeventcity.com/{$business->city}",
            ],
            'downtownsguide' => [
                'business_listing' => "https://downtownsguide.com/{$business->city}/{$business->slug}",
                'category_page' => "https://downtownsguide.com/{$business->city}/{$business->industry?->slug}",
            ],
        ];
    }
}


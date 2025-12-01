<?php

declare(strict_types=1);

namespace App\Services;

final class SeoService
{
    /**
     * Get site configuration based on domain.
     */
    public static function getSiteConfig(string $site): array
    {
        $configs = [
            'day-news' => [
                'name' => 'Day News',
                'defaultImage' => '/images/day-news-logo.png',
            ],
            'event-city' => [
                'name' => 'Go Event City',
                'defaultImage' => '/images/event-city-logo.png',
            ],
            'downtown-guide' => [
                'name' => 'Downtown Guide',
                'defaultImage' => '/images/downtown-guide-logo.png',
            ],
        ];

        return $configs[$site] ?? $configs['event-city'];
    }

    /**
     * Build canonical URL.
     */
    public static function buildCanonicalUrl(string $path): string
    {
        $baseUrl = mb_rtrim(config('app.url'), '/');

        return $baseUrl.'/'.mb_ltrim($path, '/');
    }

    /**
     * Get image URL with fallback to site default.
     */
    public static function getImageUrl(?string $image, string $site): string
    {
        if ($image) {
            if (str_starts_with($image, 'http')) {
                return $image;
            }

            return self::buildCanonicalUrl($image);
        }

        $config = self::getSiteConfig($site);

        return self::buildCanonicalUrl($config['defaultImage']);
    }

    /**
     * Build NewsArticle JSON-LD schema.
     */
    public static function buildArticleSchema(array $data, string $site): array
    {
        $config = self::getSiteConfig($site);
        $canonicalUrl = self::buildCanonicalUrl($data['url'] ?? '/');
        $imageUrl = self::getImageUrl($data['image'] ?? null, $site);

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'headline' => $data['title'],
            'description' => $data['description'] ?? '',
            'image' => $imageUrl,
            'url' => $canonicalUrl,
            'datePublished' => $data['publishedAt'] ?? null,
            'dateModified' => $data['modifiedAt'] ?? $data['publishedAt'] ?? null,
            'publisher' => [
                '@type' => 'Organization',
                'name' => $config['name'],
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => self::buildCanonicalUrl($config['defaultImage']),
                ],
            ],
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $canonicalUrl,
            ],
        ];

        if (! empty($data['articleBody'])) {
            $schema['articleBody'] = $data['articleBody'];
        }

        if (! empty($data['section'])) {
            $schema['articleSection'] = $data['section'];
        }

        if (! empty($data['author'])) {
            $schema['author'] = [
                '@type' => 'Person',
                'name' => $data['author'],
            ];
        }

        return $schema;
    }

    /**
     * Build Event JSON-LD schema.
     */
    public static function buildEventSchema(array $data, string $site): array
    {
        $config = self::getSiteConfig($site);
        $canonicalUrl = self::buildCanonicalUrl($data['url'] ?? '/');
        $imageUrl = self::getImageUrl($data['image'] ?? null, $site);

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Event',
            'name' => $data['title'],
            'description' => $data['description'] ?? '',
            'image' => $imageUrl,
            'url' => $canonicalUrl,
            'startDate' => $data['startDate'],
            'endDate' => $data['endDate'] ?? $data['startDate'],
            'offers' => [
                '@type' => 'Offer',
                'url' => $canonicalUrl,
                'price' => ($data['isFree'] ?? false) ? '0' : (string) ($data['price'] ?? '0'),
                'priceCurrency' => $data['priceCurrency'] ?? 'USD',
                'availability' => 'https://schema.org/'.($data['availability'] ?? 'InStock'),
            ],
            'organizer' => [
                '@type' => 'Organization',
                'name' => $config['name'],
            ],
        ];

        if (! empty($data['location'])) {
            $location = [
                '@type' => 'Place',
                'name' => $data['location']['name'] ?? '',
            ];

            if (! empty($data['location']['address'])) {
                $location['address'] = [
                    '@type' => 'PostalAddress',
                    'streetAddress' => $data['location']['address'],
                ];
            }

            if (! empty($data['location']['latitude']) && ! empty($data['location']['longitude'])) {
                $location['geo'] = [
                    '@type' => 'GeoCoordinates',
                    'latitude' => $data['location']['latitude'],
                    'longitude' => $data['location']['longitude'],
                ];
            }

            $schema['location'] = $location;
        }

        if (! empty($data['performer'])) {
            $schema['performer'] = [
                '@type' => 'Person',
                'name' => $data['performer'],
            ];
        }

        if (! empty($data['category'])) {
            $schema['eventCategory'] = $data['category'];
        }

        return $schema;
    }

    /**
     * Build Place JSON-LD schema for venues.
     */
    public static function buildVenueSchema(array $data, string $site): array
    {
        $canonicalUrl = self::buildCanonicalUrl($data['url'] ?? '/');
        $imageUrl = self::getImageUrl($data['image'] ?? null, $site);

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Place',
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'image' => $imageUrl,
            'url' => $canonicalUrl,
        ];

        if (! empty($data['address'])) {
            $address = [
                '@type' => 'PostalAddress',
                'streetAddress' => $data['address'],
            ];

            if (! empty($data['neighborhood'])) {
                $address['addressLocality'] = $data['neighborhood'];
            }

            $schema['address'] = $address;
        }

        if (! empty($data['latitude']) && ! empty($data['longitude'])) {
            $schema['geo'] = [
                '@type' => 'GeoCoordinates',
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
            ];
        }

        if (! empty($data['capacity'])) {
            $schema['maximumAttendeeCapacity'] = $data['capacity'];
        }

        if (! empty($data['rating']) && ! empty($data['reviewCount'])) {
            $schema['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => $data['rating'],
                'reviewCount' => $data['reviewCount'],
            ];
        }

        return $schema;
    }

    /**
     * Build Person JSON-LD schema for performers.
     */
    public static function buildPerformerSchema(array $data, string $site): array
    {
        $canonicalUrl = self::buildCanonicalUrl($data['url'] ?? '/');
        $imageUrl = self::getImageUrl($data['image'] ?? null, $site);

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Person',
            'name' => $data['name'],
            'description' => $data['bio'] ?? $data['description'] ?? '',
            'image' => $imageUrl,
            'url' => $canonicalUrl,
        ];

        if (! empty($data['homeCity'])) {
            $schema['homeLocation'] = [
                '@type' => 'Place',
                'name' => $data['homeCity'],
            ];
        }

        if (! empty($data['genres']) && is_array($data['genres'])) {
            $schema['knowsAbout'] = $data['genres'];
        }

        return $schema;
    }

    /**
     * Build LocalBusiness JSON-LD schema.
     */
    public static function buildBusinessSchema(array $data, string $site): array
    {
        $canonicalUrl = self::buildCanonicalUrl($data['url'] ?? '/');
        $imageUrl = self::getImageUrl($data['image'] ?? null, $site);

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'image' => $imageUrl,
            'url' => $canonicalUrl,
        ];

        if (! empty($data['address'])) {
            $address = [
                '@type' => 'PostalAddress',
                'streetAddress' => $data['address'],
            ];

            if (! empty($data['city'])) {
                $address['addressLocality'] = $data['city'];
            }
            if (! empty($data['state'])) {
                $address['addressRegion'] = $data['state'];
            }
            if (! empty($data['postalCode'])) {
                $address['postalCode'] = $data['postalCode'];
            }
            if (! empty($data['country'])) {
                $address['addressCountry'] = $data['country'];
            }

            $schema['address'] = $address;
        }

        if (! empty($data['latitude']) && ! empty($data['longitude'])) {
            $schema['geo'] = [
                '@type' => 'GeoCoordinates',
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
            ];
        }

        if (! empty($data['phone'])) {
            $schema['telephone'] = $data['phone'];
        }

        if (! empty($data['website'])) {
            $schema['sameAs'] = [$data['website']];
        }

        if (! empty($data['rating']) && ! empty($data['reviewCount'])) {
            $schema['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => $data['rating'],
                'reviewCount' => $data['reviewCount'],
            ];
        }

        return $schema;
    }

    /**
     * Build WebSite JSON-LD schema for homepages.
     */
    public static function buildWebsiteSchema(array $data, string $site): array
    {
        $config = self::getSiteConfig($site);
        $canonicalUrl = self::buildCanonicalUrl($data['url'] ?? '/');

        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $data['siteName'] ?? $config['name'],
            'description' => $data['description'] ?? '',
            'url' => $canonicalUrl,
            'publisher' => [
                '@type' => 'Organization',
                'name' => $config['name'],
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => self::buildCanonicalUrl($config['defaultImage']),
                ],
            ],
        ];
    }

    /**
     * Build JSON-LD schema based on content type.
     */
    public static function buildJsonLd(string $type, array $data, string $site): array
    {
        return match ($type) {
            'article' => self::buildArticleSchema($data, $site),
            'event' => self::buildEventSchema($data, $site),
            'venue' => self::buildVenueSchema($data, $site),
            'performer' => self::buildPerformerSchema($data, $site),
            'business' => self::buildBusinessSchema($data, $site),
            'website' => self::buildWebsiteSchema($data, $site),
            default => [],
        };
    }
}

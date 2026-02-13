<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PlatformProfile;
use Illuminate\Database\Seeder;

/**
 * Seeds the platform_profiles table with known platform patterns.
 * This gives the system day-one intelligence without needing to learn.
 *
 * Run: php artisan db:seed --class=PlatformProfileSeeder
 */
final class PlatformProfileSeeder extends Seeder
{
    public function run(): void
    {
        $profiles = [
            // ============================================================
            // GOVERNMENT PLATFORMS
            // ============================================================
            [
                'slug' => 'civicplus',
                'display_name' => 'CivicPlus',
                'category' => 'government',
                'detection_signatures' => ['html' => ['civicplus', 'civicengage', '/agendacenter', '/alertcenter', '/documentcenter', '/rss.aspx']],
                'best_fetch_method' => 'rss',
                'needs_js_rendering' => false,
                'content_selectors' => ['.news-flash-listing', '.calendar-list', '.agenda-list', 'article'],
                'noise_selectors' => ['nav', 'footer', '.site-header', '#mega-menu'],
                'rss_patterns' => ['/rss.aspx'],
                'confidence_score' => 1.0,
                'sample_size' => 100,
            ],
            [
                'slug' => 'granicus',
                'display_name' => 'Granicus',
                'category' => 'government',
                'detection_signatures' => ['html' => ['granicus.com'], 'url' => ['granicus.com']],
                'best_fetch_method' => 'rss',
                'needs_js_rendering' => false,
                'content_selectors' => ['.meeting-list', '.document-list'],
                'rss_patterns' => ['/xml/MediaRSS.php', '/boards/rss/'],
                'confidence_score' => 1.0,
                'sample_size' => 50,
            ],
            [
                'slug' => 'legistar',
                'display_name' => 'Legistar',
                'category' => 'government',
                'detection_signatures' => ['html' => ['legistar'], 'url' => ['legistar.com']],
                'best_fetch_method' => 'http_get',  // Has API, but RSS/API preferred
                'needs_js_rendering' => false,
                'api_patterns' => ['/v1/'],
                'confidence_score' => 1.0,
                'sample_size' => 50,
            ],
            [
                'slug' => 'nixle',
                'display_name' => 'Nixle',
                'category' => 'government',
                'detection_signatures' => ['html' => ['nixle'], 'url' => ['nixle.com']],
                'best_fetch_method' => 'http_get',
                'needs_js_rendering' => false,
                'content_selectors' => ['.alert-item', '.nixle-alert'],
                'confidence_score' => 1.0,
                'sample_size' => 30,
            ],
            [
                'slug' => 'civiclive',
                'display_name' => 'CivicLive / MuniCode',
                'category' => 'government',
                'detection_signatures' => ['html' => ['civiclive', 'municode']],
                'best_fetch_method' => 'http_get',
                'needs_js_rendering' => false,
                'content_selectors' => ['article', '.content-area', '.news-list'],
                'confidence_score' => 0.8,
                'sample_size' => 15,
            ],

            // ============================================================
            // CMS PLATFORMS
            // ============================================================
            [
                'slug' => 'wordpress',
                'display_name' => 'WordPress',
                'category' => 'cms',
                'detection_signatures' => ['html' => ['/wp-content/', '/wp-includes/', 'wp-json'], 'meta_generator' => ['wordpress']],
                'best_fetch_method' => 'rss',  // WordPress ALWAYS has RSS
                'fallback_fetch_method' => 'http_get',
                'needs_js_rendering' => false,
                'content_selectors' => ['article.post', '.entry-content', '.post-content', '.hentry'],
                'noise_selectors' => ['nav', 'footer', '.sidebar', '.widget-area', '.comment-area', '#comments'],
                'rss_patterns' => ['/feed', '/feed/rss2', '/rss', '/feed.xml'],
                'api_patterns' => ['/wp-json/wp/v2/posts'],
                'confidence_score' => 1.0,
                'sample_size' => 200,
            ],
            [
                'slug' => 'drupal',
                'display_name' => 'Drupal',
                'category' => 'cms',
                'detection_signatures' => ['html' => ['drupal.js', '/sites/default/files'], 'meta_generator' => ['drupal']],
                'best_fetch_method' => 'http_get',
                'fallback_fetch_method' => 'ai_extract',
                'needs_js_rendering' => false,
                'content_selectors' => ['article', '.node-content', '.field--name-body', '.view-content'],
                'noise_selectors' => ['nav', 'footer', '.sidebar', '#block-system-main-menu'],
                'rss_patterns' => ['/rss.xml', '/feed'],
                'confidence_score' => 0.9,
                'sample_size' => 40,
            ],
            [
                'slug' => 'joomla',
                'display_name' => 'Joomla',
                'category' => 'cms',
                'detection_signatures' => ['html' => ['/media/jui/', 'joomla'], 'meta_generator' => ['joomla']],
                'best_fetch_method' => 'http_get',
                'needs_js_rendering' => false,
                'content_selectors' => ['.item-page', '.blog-items', '.items-leading', 'article'],
                'rss_patterns' => ['/index.php?format=feed&type=rss', '/feed'],
                'confidence_score' => 0.8,
                'sample_size' => 20,
            ],
            [
                'slug' => 'ghost',
                'display_name' => 'Ghost',
                'category' => 'cms',
                'detection_signatures' => ['html' => ['ghost.org', 'content/images'], 'meta_generator' => ['ghost']],
                'best_fetch_method' => 'rss',
                'needs_js_rendering' => false,
                'content_selectors' => ['article.post-full', '.post-content', '.gh-content'],
                'rss_patterns' => ['/rss', '/rss/'],
                'confidence_score' => 0.9,
                'sample_size' => 25,
            ],

            // ============================================================
            // WEBSITE BUILDERS
            // ============================================================
            [
                'slug' => 'squarespace',
                'display_name' => 'Squarespace',
                'category' => 'website_builder',
                'detection_signatures' => ['html' => ['squarespace.com', 'sqsp.net'], 'meta_generator' => ['squarespace']],
                'best_fetch_method' => 'ai_extract',  // Squarespace DOM is unpredictable
                'fallback_fetch_method' => 'http_get',
                'needs_js_rendering' => false,  // Content is server-rendered
                'content_selectors' => ['.blog-item', '.entry-content', 'article'],
                'noise_selectors' => ['nav', 'footer', '.header', '.sqs-announcement-bar'],
                'rss_patterns' => ['?format=rss'],
                'confidence_score' => 0.85,
                'sample_size' => 30,
            ],
            [
                'slug' => 'wix',
                'display_name' => 'Wix',
                'category' => 'website_builder',
                'detection_signatures' => ['html' => ['wix.com', 'wixsite.com', 'static.wixstatic.com'], 'meta_generator' => ['wix']],
                'best_fetch_method' => 'ai_extract',  // Wix is heavy JS but server-renders
                'needs_js_rendering' => true,  // Some Wix sites need JS
                'content_selectors' => [],  // Too inconsistent
                'confidence_score' => 0.7,
                'sample_size' => 20,
            ],
            [
                'slug' => 'weebly',
                'display_name' => 'Weebly',
                'category' => 'website_builder',
                'detection_signatures' => ['html' => ['weebly.com', 'editmysite.com'], 'meta_generator' => ['weebly']],
                'best_fetch_method' => 'http_get',
                'needs_js_rendering' => false,
                'content_selectors' => ['.blog-post', '.wsite-content-inner'],
                'rss_patterns' => ['/1/feed'],
                'confidence_score' => 0.75,
                'sample_size' => 15,
            ],
            [
                'slug' => 'godaddy',
                'display_name' => 'GoDaddy Website Builder',
                'category' => 'website_builder',
                'detection_signatures' => ['html' => ['godaddy.com', 'secureserver.net'], 'meta_generator' => ['godaddy']],
                'best_fetch_method' => 'ai_extract',
                'needs_js_rendering' => true,
                'content_selectors' => [],
                'confidence_score' => 0.6,
                'sample_size' => 10,
            ],

            // ============================================================
            // ECOMMERCE
            // ============================================================
            [
                'slug' => 'shopify',
                'display_name' => 'Shopify',
                'category' => 'ecommerce',
                'detection_signatures' => ['html' => ['cdn.shopify.com', 'shopify.com', 'myshopify.com']],
                'best_fetch_method' => 'http_get',
                'needs_js_rendering' => false,
                'content_selectors' => ['article', '.article-content', '.blog-article'],
                'noise_selectors' => ['nav', 'footer', '.cart-drawer'],
                'rss_patterns' => ['/blogs/news.atom', '/blogs/news/feed'],
                'confidence_score' => 0.85,
                'sample_size' => 25,
            ],

            // ============================================================
            // NEWS & CONTENT
            // ============================================================
            [
                'slug' => 'patch',
                'display_name' => 'Patch.com',
                'category' => 'news',
                'detection_signatures' => ['url' => ['patch.com'], 'html' => ['patch.com']],
                'best_fetch_method' => 'http_get',
                'needs_js_rendering' => false,
                'content_selectors' => ['article', '.story-card', '.styles_Card'],
                'rss_patterns' => ['/feed'],
                'confidence_score' => 0.9,
                'sample_size' => 30,
            ],
            [
                'slug' => 'substack',
                'display_name' => 'Substack',
                'category' => 'news',
                'detection_signatures' => ['url' => ['substack.com'], 'html' => ['substack.com', 'substackcdn.com']],
                'best_fetch_method' => 'rss',
                'needs_js_rendering' => false,
                'content_selectors' => ['.post-content', '.body'],
                'rss_patterns' => ['/feed'],
                'confidence_score' => 0.95,
                'sample_size' => 20,
            ],

            // ============================================================
            // EVENT PLATFORMS
            // ============================================================
            [
                'slug' => 'eventbrite',
                'display_name' => 'Eventbrite',
                'category' => 'events',
                'detection_signatures' => ['url' => ['eventbrite.com'], 'html' => ['eventbrite']],
                'best_fetch_method' => 'ai_extract',  // API preferred but AI extract works
                'needs_js_rendering' => true,
                'content_selectors' => ['.search-event-card', '.event-card'],
                'confidence_score' => 0.8,
                'sample_size' => 15,
            ],
            [
                'slug' => 'facebook',
                'display_name' => 'Facebook',
                'category' => 'social',
                'detection_signatures' => ['url' => ['facebook.com', 'fb.com']],
                'best_fetch_method' => 'ai_extract',  // Facebook blocks most scraping
                'needs_js_rendering' => true,
                'content_selectors' => [],
                'confidence_score' => 0.5,
                'sample_size' => 10,
                'metadata' => ['note' => 'Facebook blocks most automated access. Use API when possible.'],
            ],

            // ============================================================
            // GENERIC / FALLBACK
            // ============================================================
            [
                'slug' => 'static_html',
                'display_name' => 'Static HTML',
                'category' => 'custom',
                'detection_signatures' => ['server' => ['apache', 'nginx']],
                'best_fetch_method' => 'ai_extract',
                'needs_js_rendering' => false,
                'content_selectors' => ['article', 'main', '.content', '#content'],
                'noise_selectors' => ['nav', 'footer', 'header', 'aside', '.sidebar'],
                'confidence_score' => 0.6,
                'sample_size' => 50,
            ],
            [
                'slug' => 'spa_javascript',
                'display_name' => 'JavaScript SPA',
                'category' => 'custom',
                'detection_signatures' => ['html' => ['id="root"', 'id="app"', 'id="__next"', 'id="__nuxt"']],
                'best_fetch_method' => 'playwright',
                'fallback_fetch_method' => 'scrapingbee_js',
                'needs_js_rendering' => true,
                'content_selectors' => [],
                'confidence_score' => 0.7,
                'sample_size' => 20,
                'metadata' => ['note' => 'Requires JS rendering. Content not available in initial HTML.'],
            ],
        ];

        foreach ($profiles as $data) {
            PlatformProfile::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, ['is_active' => true])
            );
        }

        $this->command->info('Seeded '.count($profiles).' platform profiles.');
    }
}

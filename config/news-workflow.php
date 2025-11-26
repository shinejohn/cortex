<?php

declare(strict_types=1);

return [
    // Phase 1: Business Discovery
    'business_discovery' => [
        'enabled' => env('NEWS_WORKFLOW_BUSINESS_DISCOVERY_ENABLED', true),
        'categories' => [
            'restaurant',
            'cafe',
            'retail',
            'entertainment',
            'healthcare',
            'professional_services',
        ],
        'radius_km' => env('NEWS_WORKFLOW_BUSINESS_RADIUS', 25),
    ],

    // Phase 2: News Collection
    'news_collection' => [
        'enabled' => env('NEWS_WORKFLOW_NEWS_COLLECTION_ENABLED', true),
        'max_articles_per_business' => env('NEWS_WORKFLOW_MAX_ARTICLES_PER_BUSINESS', 5),
        'max_category_articles' => env('NEWS_WORKFLOW_MAX_CATEGORY_ARTICLES', 20),
        'lookback_days' => env('NEWS_WORKFLOW_LOOKBACK_DAYS', 7),
    ],

    // Phase 3: Shortlisting
    'shortlisting' => [
        'enabled' => env('NEWS_WORKFLOW_SHORTLISTING_ENABLED', true),
        'articles_per_region' => env('NEWS_WORKFLOW_SHORTLIST_COUNT', 10),
        'min_relevance_score' => env('NEWS_WORKFLOW_MIN_RELEVANCE_SCORE', 60),
    ],

    // Phase 4: Fact-Checking
    'fact_checking' => [
        'enabled' => env('NEWS_WORKFLOW_FACT_CHECKING_ENABLED', false),
        'min_confidence_score' => env('NEWS_WORKFLOW_MIN_CONFIDENCE_SCORE', 70),
        'max_sources_per_claim' => env('NEWS_WORKFLOW_MAX_SOURCES', 3),
    ],

    // Phase 5: Final Selection
    'final_selection' => [
        'enabled' => env('NEWS_WORKFLOW_FINAL_SELECTION_ENABLED', true),
        'articles_per_region' => env('NEWS_WORKFLOW_FINAL_COUNT', 12),
        'min_quality_score' => env('NEWS_WORKFLOW_MIN_QUALITY_SCORE', 75),
    ],

    // Phase 6: Article Generation
    'article_generation' => [
        'enabled' => env('NEWS_WORKFLOW_ARTICLE_GENERATION_ENABLED', true),
        'ai_model' => env('NEWS_WORKFLOW_AI_MODEL_GENERATION', 'openai/gpt-4'),
        'max_tokens' => env('NEWS_WORKFLOW_MAX_TOKENS', 2000),
    ],

    // Phase 7: Publishing
    'publishing' => [
        'enabled' => env('NEWS_WORKFLOW_PUBLISHING_ENABLED', true),
        'auto_publish_threshold' => env('NEWS_WORKFLOW_AUTO_PUBLISH_THRESHOLD', 85), // Hybrid: auto-publish if quality_score >= 85
        'default_workspace_id' => env('NEWS_WORKFLOW_WORKSPACE_ID'),
        'default_author_id' => env('NEWS_WORKFLOW_AUTHOR_ID'),
        'category' => 'local_news',
        'type' => 'article',
    ],

    // AI Models Per Phase (configurable for cost/quality balance)
    // Using OpenRouter - set OPENROUTER_API_KEY in .env
    // Browse models at: https://openrouter.ai/models
    // Format: ['provider', 'model'] for prism()->using($provider, $model)
    'ai_models' => [
        'scoring' => ['openrouter', env('NEWS_WORKFLOW_AI_MODEL_SCORING', env('PRISM_MODEL', 'meta-llama/llama-3.1-8b-instruct'))], // Phase 3 & 5
        'outline' => ['openrouter', env('NEWS_WORKFLOW_AI_MODEL_OUTLINE', env('PRISM_MODEL', 'meta-llama/llama-3.1-8b-instruct'))], // Phase 4
        'generation' => ['openrouter', env('NEWS_WORKFLOW_AI_MODEL_GENERATION', env('PRISM_MODEL', 'meta-llama/llama-3.1-8b-instruct'))], // Phase 6
    ],

    // External APIs
    'apis' => [
        'serpapi_key' => env('SERPAPI_KEY'),
        'scrapingbee_key' => env('SCRAPINGBEE_API_KEY'),
    ],

    // Unsplash API for article images
    'unsplash' => [
        'enabled' => env('UNSPLASH_ENABLED', true),
        'access_key' => env('UNSPLASH_ACCESS_KEY', ''),
        'orientation' => 'landscape', // landscape, portrait, squarish
        'fallback_enabled' => true, // Use fallback images if API fails
    ],

    // Error Handling
    'error_handling' => [
        'retry_attempts' => 3,
        'retry_delay_seconds' => 5,
        'log_channel' => 'stack',
    ],
];

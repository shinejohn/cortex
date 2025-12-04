<?php

declare(strict_types=1);

return [
    // Phase 1: Business Discovery
    'business_discovery' => [
        'enabled' => env('NEWS_WORKFLOW_BUSINESS_DISCOVERY_ENABLED', true),
        'categories' => [
            'night_club',           // Live music, DJ events, club nights
            'bar',                  // Special events, live music, trivia nights
            'performing_arts_theater', // Plays, concerts, performances
            'art_gallery',          // Exhibition openings, artist talks
            'museum',               // New exhibits, special events
            'movie_theater',        // Film premieres, special screenings
            'concert_hall',         // Concerts, recitals, performances
            'stadium',              // Sports events, concerts
            'casino',               // Shows, tournaments, special events
            'amusement_park',       // Seasonal events, new attractions
            'zoo',                  // Special exhibits, events
            'aquarium',             // New exhibits, feeding times, events
            'bowling_alley',        // Tournaments, league nights
            'spa',                  // Wellness events, workshops
            'gym',                  // Fitness classes, challenges, events
            'restaurant',           // Special dinners, chef events, tastings
            'cafe',                 // Open mics, art shows, music nights
            'brewery',              // Tap takeovers, live music, food trucks
            'winery',               // Tastings, tours, harvest events
            'shopping_mall',        // Seasonal events, pop-ups, shows
            'convention_center',    // Conventions, expos, trade shows
            'library',              // Author talks, workshops, readings
            'bookstore',            // Book signings, readings, launches
            'park',                 // Festivals, concerts, outdoor events
            'campground',           // Seasonal events, activities
            'tourist_attraction',   // Special tours, seasonal offerings
            'university',           // Lectures, sporting events, performances, open houses
            'school',               // School plays, sporting events, fundraisers, exhibitions
            'city_hall',            // Town halls, public meetings, community forums
            'courthouse',           // Public hearings, community events
            'local_government_office', // Public meetings, community outreach
            'police',               // Community safety events, open houses, youth programs
            'fire_station',         // Safety demonstrations, open houses, training events
            'community_center',     // Classes, workshops, public events, meetings
            'town_hall',            // Council meetings, public forums, community events
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

    // Event Extraction Pipeline (parallel to news workflow, runs after Phase 2)
    'event_extraction' => [
        'enabled' => env('NEWS_WORKFLOW_EVENT_EXTRACTION_ENABLED', true),

        // Detection threshold - articles below this won't proceed to extraction
        'min_detection_confidence' => env('NEWS_WORKFLOW_EVENT_MIN_DETECTION', 60),

        // Extraction quality threshold
        'min_extraction_confidence' => env('NEWS_WORKFLOW_EVENT_MIN_EXTRACTION', 70),

        // Auto-publish threshold - events above this are published, below are drafts
        'auto_publish_threshold' => env('NEWS_WORKFLOW_EVENT_AUTO_PUBLISH_THRESHOLD', 85),

        // Venue/Performer matching thresholds (0-1 similarity score)
        'venue_match_threshold' => env('NEWS_WORKFLOW_VENUE_MATCH_THRESHOLD', 0.85),
        'performer_match_threshold' => env('NEWS_WORKFLOW_PERFORMER_MATCH_THRESHOLD', 0.85),

        // System workspace for AI-extracted events (will be claimable later)
        'system_workspace_id' => env('NEWS_WORKFLOW_SYSTEM_WORKSPACE_ID'),
        'system_workspace_name' => env('NEWS_WORKFLOW_SYSTEM_WORKSPACE_NAME', 'AI Event Extraction'),

        // Max events to extract per region per run
        'max_events_per_region' => env('NEWS_WORKFLOW_MAX_EVENTS_PER_REGION', 20),

        // Category mapping from extracted categories to Event model categories
        'category_mapping' => [
            'music' => 'music',
            'festival' => 'festival',
            'sports' => 'sports',
            'arts' => 'arts',
            'business' => 'business',
            'community' => 'community',
            'food-drink' => 'food-drink',
            'charity' => 'charity',
            'family' => 'family',
            'nightlife' => 'nightlife',
            'other' => 'other',
        ],
    ],

    // AI Models Per Phase (configurable for cost/quality balance)
    // Using OpenRouter - set OPENROUTER_API_KEY in .env
    // Browse models at: https://openrouter.ai/models
    // Format: ['provider', 'model'] for prism()->using($provider, $model)
    'ai_models' => [
        'scoring' => ['openrouter', env('NEWS_WORKFLOW_AI_MODEL_SCORING', env('PRISM_MODEL', 'meta-llama/llama-3.1-8b-instruct'))], // Phase 3 & 5
        'outline' => ['openrouter', env('NEWS_WORKFLOW_AI_MODEL_OUTLINE', env('PRISM_MODEL', 'meta-llama/llama-3.1-8b-instruct'))], // Phase 4
        'fact_checking' => ['openrouter', env('NEWS_WORKFLOW_AI_MODEL_FACT_CHECKING', env('PRISM_MODEL', 'meta-llama/llama-3.1-8b-instruct'))], // Phase 4
        'generation' => ['openrouter', env('NEWS_WORKFLOW_AI_MODEL_GENERATION', env('PRISM_MODEL', 'meta-llama/llama-3.1-8b-instruct'))], // Phase 6
        'event_detection' => ['openrouter', env('NEWS_WORKFLOW_AI_MODEL_EVENT_DETECTION', env('PRISM_MODEL', 'meta-llama/llama-3.1-8b-instruct'))], // Event Detection
        'event_extraction' => ['openrouter', env('NEWS_WORKFLOW_AI_MODEL_EVENT_EXTRACTION', env('PRISM_MODEL', 'meta-llama/llama-3.1-8b-instruct'))], // Event Extraction
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

        // Local storage configuration
        'storage' => [
            'enabled' => env('UNSPLASH_STORAGE_ENABLED', true),
            'disk' => env('UNSPLASH_STORAGE_DISK', 'public'), // 'public' or 's3'
            'path' => 'unsplash', // Base path within disk
            'size' => 'regular', // Which size to download (regular = ~1080px)
        ],
    ],

    // Error Handling
    'error_handling' => [
        'retry_attempts' => 3,
        'retry_delay_seconds' => 5,
        'log_channel' => 'stack',
    ],

    // AI Prompts (whitelabel - no external links or source mentions)
    'prompts' => [
        'relevance_scoring' => <<<'PROMPT'
You are an experienced local news editor evaluating articles for {region_name} ({region_type}).

Article Details:
Title: {title}
Content: {content_snippet}

Task: Evaluate this article's relevance for local news in {region_name}.

Scoring Criteria:
- Local Impact (40%): Direct relevance to the local community
- Timeliness (20%): How recent and timely the news is
- Community Interest (20%): Likely interest from local residents
- Informativeness (20%): Value and depth of information

Provide:
1. A relevance score from 0-100
2. Topic tags for categorization (e.g., business, community, events, government)
3. Brief rationale for your score
PROMPT,

        'outline' => <<<'PROMPT'
You are a professional journalist creating an article outline based on this news topic:

Title: {title}
Content: {content_snippet}

Task: Create a structured outline for a well-organized local news article.

Requirements:
- Suggest an engaging, informative title
- Create 3-5 logical section headings
- Identify 5-8 key points to cover
- Ensure the outline flows naturally from introduction to conclusion
- Do NOT include any external links or URLs
- Do NOT reference or attribute any external news sources, agencies, or publishers

Focus on local news style: clear, factual, and community-focused.
PROMPT,

        'fact_check' => <<<'PROMPT'
You are a fact-checker evaluating a specific claim from a news article.

Article Context:
Title: {title}
Published: {date}
Content: {content}

Claim to Verify:
"{claim}"

Task: Evaluate this claim based on the article context and general knowledge.

Provide:
1. Result: Choose one of:
   - "verified": Claim is directly supported by the article and appears factually accurate
   - "plausible": Claim seems reasonable based on context but lacks definitive proof
   - "unverified": Insufficient information to verify the claim
   - "disputed": Claim contradicts known facts or the article context

2. Confidence Score (0-100): How confident are you in this assessment?

3. Rationale: Brief explanation (1-2 sentences) of your verification decision

Be objective and base your assessment primarily on the article content provided.
PROMPT,

        'claim_extraction' => <<<'PROMPT'
You are a fact-checker reviewing this article outline:

{outline}

Task: Extract specific factual claims that should be verified before publication.

Focus on:
- Statistics, numbers, and data points
- Statements about events, dates, or timelines
- Claims about people, organizations, or policies
- Any statements that could be objectively verified

For each claim:
- Importance: high (critical facts), medium (supporting facts), low (minor details)
- Sources needed: Number of independent sources required (1-3)

Only extract claims that are verifiable through external sources.
PROMPT,

        'quality_evaluation' => <<<'PROMPT'
You are a senior editor evaluating this article draft for publication quality:

Outline:
{outline}

Fact-Check Summary: {fact_check_count} claims verified

Task: Provide a comprehensive quality assessment.

Evaluation Criteria:
- Content Quality (30%): Writing quality, clarity, completeness
- Factual Accuracy (30%): Based on fact-check results
- Local Relevance (20%): Community value and impact
- Professionalism (20%): Tone, structure, readability

Provide:
1. Overall quality score (0-100)
2. Fact-check confidence estimate based on verification results
3. Key strengths (3-5 points)
4. Areas for improvement (if any)
PROMPT,

        'article_generation' => <<<'PROMPT'
You are a professional journalist writing a local news article for our publication.

Context:
- Today's date: {today_date}
- Region: {region_name}
- Publication: Day News (local community news platform)

Title: {title}

Outline:
{outline}

Verified Facts:
{fact_check_summary}

Task: Write a complete, publication-ready article.

Requirements:
- Write in clear, professional journalism style
- Use HTML formatting (<p>, <h2>, <strong>, <em>, etc.)
- Incorporate all verified facts accurately
- Maintain objective, balanced tone
- Write 400-600 words
- Include proper paragraph breaks
- Create an engaging excerpt (a brief summary sentence, do NOT include character counts or metadata in the excerpt)
- Use appropriate tense based on whether events are past, present, or upcoming
- Reference dates relative to today when relevant (e.g., "yesterday", "last week", "next Monday")
- Do NOT include any external links or URLs in the content
- Do NOT mention or attribute any external news sources, agencies, wire services, or publishers
- Present all information as original reporting from our publication
- Do NOT use phrases like "according to [source]", "reported by [agency]", or similar attributions

Focus on local news standards: factual, informative, and community-focused.
All content should appear as our own original journalism.
PROMPT,

        'event_detection' => <<<'PROMPT'
You are an expert at identifying events mentioned in news articles.

Article Details:
Title: {title}
Content: {content_snippet}
Published: {published_at}
Region: {region_name}

Task: Determine if this article contains information about an UPCOMING event.

An event is:
- A scheduled gathering, performance, show, festival, or activity
- Has a specific date/time (or can be reasonably inferred)
- Takes place at a specific location
- Is open to public attendance (free or ticketed)

NOT events (reject these):
- Past events (already happened)
- General news stories without event information
- Business announcements without public gatherings
- Regular business hours/operations
- Recurring weekly events without a specific upcoming date

Provide your assessment:
1. contains_event: true/false
2. confidence_score: 0-100 (how confident you are)
3. event_date_mentioned: true/false (is a specific date mentioned)
4. rationale: Brief explanation (1-2 sentences)
PROMPT,

        'event_extraction' => <<<'PROMPT'
You are an expert at extracting structured event information from news articles.

Article Details:
Title: {title}
Content: {content_snippet}
Published: {published_at}
Region: {region_name}

Task: Extract complete event details from this article.

Extract:
1. title: An engaging event title (create one if not explicitly stated)
2. event_date: Date and time in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
   - If time not specified, default to 19:00
   - If date range, use start date
3. time: Display time (e.g., "7:00 PM - 10:00 PM")
4. venue_name: The venue/location name (be specific, not just "local venue")
5. venue_address: Full address if available
6. description: 2-3 sentence summary of the event
7. category: One of (music, festival, sports, arts, business, community, food-drink, charity, family, nightlife, other)
8. subcategories: Up to 3 relevant tags as array
9. is_free: true/false
10. price_min: Minimum ticket price (0 if free)
11. price_max: Maximum ticket price (0 if free or single price)
12. performer_name: Artist/performer name if applicable (null if none)
13. badges: Array of applicable badges (featured, family-friendly, outdoor, 21+, food-included)

Important:
- Do NOT include external links or URLs
- If information is unclear, make reasonable assumptions and note low confidence
- Dates must be in the future relative to the published date
PROMPT,
    ],
];

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

    // Fetch Frequencies - configure how often each category is fetched
    'fetch_frequencies' => [
        // Default frequency for categories not explicitly configured
        'default' => 'daily',

        // News category frequencies (can be overridden via admin UI)
        // Format: 'category' => 'daily'|'weekly'|'monthly' OR ['custom_days', N]
        'news_categories' => [
            // High frequency (daily) - venues with frequent events/news
            'night_club' => 'daily',
            'bar' => 'daily',
            'restaurant' => 'daily',
            'cafe' => 'daily',
            'brewery' => 'daily',
            'casino' => 'daily',

            // Medium frequency (every 3 days)
            'performing_arts_theater' => ['custom_days', 3],
            'concert_hall' => ['custom_days', 3],
            'movie_theater' => ['custom_days', 3],
            'stadium' => ['custom_days', 3],
            'amusement_park' => ['custom_days', 3],
            'park' => ['custom_days', 3],
            'convention_center' => ['custom_days', 3],
            'community_center' => ['custom_days', 3],

            // Low frequency (weekly) - venues with less frequent updates
            'museum' => 'weekly',
            'art_gallery' => 'weekly',
            'library' => 'weekly',
            'bookstore' => 'weekly',
            'zoo' => 'weekly',
            'aquarium' => 'weekly',
            'bowling_alley' => 'weekly',
            'gym' => 'weekly',
            'spa' => 'weekly',
            'winery' => 'weekly',
            'shopping_mall' => 'weekly',
            'campground' => 'weekly',
            'tourist_attraction' => 'weekly',
            'university' => 'weekly',
            'school' => 'weekly',
            'city_hall' => 'weekly',
            'courthouse' => 'weekly',
            'local_government_office' => 'weekly',
            'town_hall' => 'weekly',
            'police' => 'weekly',
            'fire_station' => 'weekly',
        ],

        // Business category frequencies (for filtering businesses by their categories)
        'business_categories' => [
            // If not defined, falls back to 'default'
        ],
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
        'temperature' => env('NEWS_WORKFLOW_GENERATION_TEMPERATURE', 0.3), // Lower = more deterministic, less creative
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

Hyper-Local Priority:
- Articles that directly name {region_name} should score HIGHER
- Stories about local businesses, residents, schools, local government score HIGHER
- National or state-level news that only tangentially mentions the area should score LOWER
- Reject articles about other cities/regions with similar names (e.g., Melbourne Australia vs Melbourne FL)

Content Completeness Check:
- Does the article contain enough specific details (names, locations, dates, facts) to write a complete news story?
- Articles that are too vague, lack key details, or would require extensive placeholder text should score LOWER
- Prefer articles with concrete, verifiable information over those with missing critical details

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

Local Story Structure:
- The lead should establish immediate relevance to local residents
- Include a "Community Impact" angle - how does this affect daily life here?
- Frame the story from a local resident's perspective, not an outside observer

CRITICAL - No Placeholder Text:
- Do NOT use bracketed placeholders like [Name], [Location], [Date], [Company] in the outline
- Only include key points that can be written with the information available
- If specific details are missing from the source, note them as "details pending official release" rather than using brackets
- The outline should only contain points that can be fully articulated in the final article

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

CRITICAL - Check for Placeholder Text:
- Scan for ANY bracketed placeholder text like [Name], [Location], [Address], [Time], [Company Name], etc.
- Check for phrases like "[Apartment Complex Name, if known]", "[Victim's Name]", "[Street Name]", "[Spokesperson's Name]"
- If ANY placeholder text is found, the article FAILS quality evaluation (score should be below 50)
- Publication-ready content must have NO fill-in-the-blank elements

Provide:
1. Overall quality score (0-100) - MUST be below 50 if placeholders are found
2. Fact-check confidence estimate based on verification results
3. Key strengths (3-5 points)
4. Areas for improvement (if any)
5. placeholder_detected: true/false - whether any bracketed placeholder text was found
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

Writing Style - Community Journalism:
- Write as a journalist embedded in {region_name} - you know the community
- Use phrases like "local residents", "here in {region_name}", "our community"
- Lead with the local angle - how does this directly affect people in {region_name}?
- Avoid the formal, detached tone of national news
- Be conversational but professional - like a trusted neighbor sharing important news
- Focus on the "so what" for local readers - why should they care?
- Reference local landmarks, neighborhoods, or institutions when relevant

Technical Requirements:
- Use HTML formatting (<p>, <h2>, <strong>, <em>, etc.)
- Incorporate all verified facts accurately
- Write 400-600 words
- Include proper paragraph breaks
- Create an engaging excerpt (a brief summary sentence, do NOT include character counts or metadata in the excerpt)
- Use appropriate tense based on whether events are past, present, or upcoming
- Reference dates relative to today when relevant (e.g., "yesterday", "last week", "next Monday")
- Do NOT include any external links or URLs in the content
- Do NOT mention or attribute any external news sources, agencies, wire services, or publishers
- Present all information as original reporting from our publication
- Do NOT use phrases like "according to [source]", "reported by [agency]", or similar attributions

CRITICAL - PLACEHOLDER PROHIBITION:
- NEVER use placeholder text in brackets like [Name], [Location], [Address], [Time], etc.
- NEVER use phrases like "[Apartment Complex Name, if known]", "[Victim's Name]", "[Street Name]", "[Spokesperson's Name]", or ANY similar bracketed placeholders
- If specific information is unknown, either:
  1. Omit that detail entirely and write around it
  2. Use general descriptive language (e.g., "a local apartment complex" instead of "[Apartment Complex Name]")
  3. Use phrases like "authorities have not released the name" or "the location has not been disclosed"
- The article MUST be ready for immediate publication with NO missing information indicators
- Every sentence must be complete and self-contained without any fill-in-the-blank elements

All content should appear as our own original journalism from {region_name}.
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
5. venue_address: Full address if available, or use city/region name if specific address unknown
6. description: 2-3 sentence summary of the event
7. category: One of (music, festival, sports, arts, business, community, food-drink, charity, family, nightlife, other)
8. subcategories: Up to 3 relevant tags as array
9. is_free: true/false
10. price_min: Minimum ticket price (0 if free)
11. price_max: Maximum ticket price (0 if free or single price)
12. performer_name: Artist/performer name if applicable (null if none)
13. badges: Array of applicable badges (featured, family-friendly, outdoor, 21+, food-included)

CRITICAL - No Placeholder Text:
- NEVER use bracketed placeholders like [Venue Name], [Address], [Time], [Price] in any field
- If venue name is unknown, use a descriptive phrase like "Downtown venue" or "Local community center"
- If address is unknown, use the city/region name (e.g., "Melbourne, FL")
- All fields must contain actual content, not placeholder indicators

Important:
- Do NOT include external links or URLs
- If information is unclear, use general descriptive language rather than placeholders
- Dates must be in the future relative to the published date
PROMPT,
    ],
];

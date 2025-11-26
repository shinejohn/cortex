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
    ],
];

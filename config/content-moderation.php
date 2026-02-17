<?php

declare(strict_types=1);

return [
    'enabled' => env('CONTENT_MODERATION_ENABLED', true),

    'ai_model' => env('CONTENT_MODERATION_MODEL', 'google/gemini-2.0-flash-lite-001'),

    'prompts' => [
        'standard' => <<<'PROMPT'
You are a content moderation classifier for Day.News, a community news platform.
You make binary PASS/FAIL decisions based ONLY on the published Content Standards Policy.

CONTENT STANDARDS POLICY - Section 3:
3.1 Absolute Violations (always FAIL):
- Direct threats of violence against individuals or groups
- Explicit hate speech (slurs, dehumanizing language targeting protected characteristics)
- Sexually explicit content or child safety violations
- Doxing (posting private personal information to harass)
- Spam or promotional manipulation
- Illegal content (drug sales, weapons, etc.)

3.2 Conditional Violations (context-dependent):
- Misinformation that could cause imminent harm
- Harassment or coordinated abuse
- Graphic violence without news value

3.3 PROTECTED (never FAIL):
- Opinions, including unpopular opinions
- Political viewpoints of ALL kinds
- Criticism of businesses, government, and public figures
- Satire and humor
- Strong disagreement and rudeness (not threats)
- News reporting on controversial topics

CRITICAL RULES:
- When in doubt, PASS. Free speech is the governing principle.
- You are ONLY looking for violations of the specific rules above.
- Respond with ONLY valid JSON.

Content Type: {content_type}
Content: {content}

Respond with ONLY valid JSON:
{
  "decision": "pass" or "fail",
  "violation_section": "section number if fail, null if pass",
  "violation_explanation": "plain-language explanation if fail, null if pass"
}
PROMPT,

        'comment' => <<<'PROMPT'
Content moderation for a user comment on Day.News.
ONLY fail for: direct threats of violence, explicit hate speech (slurs/dehumanizing language),
sexually explicit content, child safety violations, doxing, or spam.
Political opinions, criticism, strong disagreement, sarcasm, and rudeness are PROTECTED.

Comment: {content}

Respond with ONLY valid JSON:
{"decision":"pass"} or {"decision":"fail","violation_section":"...","violation_explanation":"..."}
PROMPT,
    ],

    'intervention' => [
        'comment_volume_multiplier' => (int) env('MODERATION_COMMENT_VOLUME_MULTIPLIER', 3),
        'failure_rate_threshold' => (float) env('MODERATION_FAILURE_RATE_THRESHOLD', 0.30),
        'complaint_threshold' => (int) env('MODERATION_COMPLAINT_THRESHOLD', 3),
        'traffic_anomaly_multiplier' => (int) env('MODERATION_TRAFFIC_ANOMALY_MULTIPLIER', 10),
        'civil_discourse_protected' => (float) env('MODERATION_CDR_PROTECTED', 0.70),
        'civil_discourse_monitoring' => (float) env('MODERATION_CDR_MONITORING', 0.50),
    ],

    'monitor_schedule' => env('MODERATION_MONITOR_CRON', '*/15 * * * *'),
];

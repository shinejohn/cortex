<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Links articles to story threads with metadata about their role in the narrative
 */
class StoryThreadArticle extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'story_thread_id',
        'news_article_id',
        'sequence_number',
        'narrative_role',
        'contribution_summary',
        'views_at_link',
        'comments_at_link',
        'engagement_score',
    ];

    protected $casts = [
        'sequence_number' => 'integer',
        'views_at_link' => 'integer',
        'comments_at_link' => 'integer',
        'engagement_score' => 'decimal:2',
    ];

    // Narrative roles
    public const ROLE_ORIGIN = 'origin';           // First article, introduces the story
    public const ROLE_DEVELOPMENT = 'development'; // Major development/update
    public const ROLE_UPDATE = 'update';           // Minor update
    public const ROLE_BACKGROUND = 'background';   // Context/explainer
    public const ROLE_RESOLUTION = 'resolution';   // Story concludes
    public const ROLE_FOLLOWUP = 'followup';       // Follow-up after resolution

    public function storyThread(): BelongsTo
    {
        return $this->belongsTo(StoryThread::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(NewsArticle::class, 'news_article_id');
    }

    /**
     * Check if this is the origin article
     */
    public function isOrigin(): bool
    {
        return $this->narrative_role === self::ROLE_ORIGIN;
    }

    /**
     * Check if this is the resolution
     */
    public function isResolution(): bool
    {
        return $this->narrative_role === self::ROLE_RESOLUTION;
    }
}

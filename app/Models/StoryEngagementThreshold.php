<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Story Engagement Threshold
 * 
 * Defines what constitutes "high engagement" for a specific category/region
 */
class StoryEngagementThreshold extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'engagement_thresholds';

    protected $fillable = [
        'region_id',
        'category',
        'subcategory',
        'views_threshold',
        'comments_threshold',
        'shares_threshold',
        'engagement_score_threshold',
        'avg_views',
        'avg_comments',
        'std_dev_views',
        'calculated_at',
    ];

    protected $casts = [
        'views_threshold' => 'integer',
        'comments_threshold' => 'integer',
        'shares_threshold' => 'integer',
        'engagement_score_threshold' => 'decimal:2',
        'avg_views' => 'decimal:2',
        'avg_comments' => 'decimal:2',
        'std_dev_views' => 'decimal:2',
        'calculated_at' => 'datetime',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }
}

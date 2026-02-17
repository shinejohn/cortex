<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AiCreatorSession extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'region_id',
        'content_type',
        'seo_analysis',
        'quality_analysis',
        'fact_check_results',
        'classification',
        'moderation_result',
        'current_title',
        'current_content',
        'ai_suggestions',
        'status',
        'published_content_id',
        'published_content_type',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOfType($query, string $contentType)
    {
        return $query->where('content_type', $contentType);
    }

    protected function casts(): array
    {
        return [
            'seo_analysis' => 'array',
            'quality_analysis' => 'array',
            'fact_check_results' => 'array',
            'classification' => 'array',
            'moderation_result' => 'array',
            'ai_suggestions' => 'array',
        ];
    }
}

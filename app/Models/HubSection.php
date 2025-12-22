<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class HubSection extends Model
{
    /** @use HasFactory<\Database\Factories\HubSectionFactory> */
    use HasFactory, HasUuid;

    public const TYPE_ANALYTICS = 'analytics';
    public const TYPE_ARTICLES = 'articles';
    public const TYPE_COMMUNITY = 'community';
    public const TYPE_EVENTS = 'events';
    public const TYPE_GALLERY = 'gallery';
    public const TYPE_PERFORMERS = 'performers';
    public const TYPE_VENUES = 'venues';
    public const TYPE_CUSTOM = 'custom';

    public const TYPES = [
        self::TYPE_ANALYTICS,
        self::TYPE_ARTICLES,
        self::TYPE_COMMUNITY,
        self::TYPE_EVENTS,
        self::TYPE_GALLERY,
        self::TYPE_PERFORMERS,
        self::TYPE_VENUES,
        self::TYPE_CUSTOM,
    ];

    protected $fillable = [
        'hub_id',
        'type',
        'title',
        'description',
        'content',
        'settings',
        'is_visible',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'settings' => 'array',
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function hub(): BelongsTo
    {
        return $this->belongsTo(Hub::class);
    }
}


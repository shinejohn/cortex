<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

final class MediaAsset extends Model
{
    /** @use HasFactory<\Database\Factories\MediaAssetFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    public const SOURCE_UNSPLASH = 'unsplash';

    public const SOURCE_GOOGLE_PLACES = 'google_places';

    public const SOURCE_USER_UPLOAD = 'user_upload';

    public const SOURCE_SCRAPE = 'scrape';

    public const SOURCE_AI_GENERATED = 'ai_generated';

    public const SOURCE_PICSUM = 'picsum';

    public const LICENSE_UNSPLASH = 'unsplash';

    public const LICENSE_GOOGLE_PLACES = 'google_places_tos';

    public const LICENSE_CC_BY = 'cc_by';

    public const LICENSE_CC0 = 'cc0';

    public const LICENSE_ALL_RIGHTS = 'all_rights';

    public const LICENSE_USER_GRANTED = 'user_granted';

    public const LICENSE_EDITORIAL = 'editorial_only';

    protected $fillable = [
        'storage_disk', 'storage_path', 'public_url', 'thumb_url', 'small_url',
        'original_url', 'file_hash',
        'width', 'height', 'mime_type', 'file_size_bytes', 'dominant_color',
        'source_type', 'source_id', 'license_type', 'requires_attribution',
        'photographer_name', 'photographer_url', 'source_platform_name',
        'source_platform_url', 'attribution_html', 'raw_attributions',
        'alt_text', 'description', 'tags', 'ai_tags', 'category', 'subcategory',
        'region_id', 'latitude', 'longitude', 'location_name',
        'uploaded_by_user_id', 'business_id', 'google_place_id',
        'quality_score', 'is_approved', 'is_featured', 'is_local', 'quality_notes',
        'usage_count', 'last_used_at', 'used_in', 'status',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->where('region_id', $regionId);
    }

    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeLocal($query)
    {
        return $query->where('is_local', true);
    }

    public function scopeBySource($query, string $source)
    {
        return $query->where('source_type', $source);
    }

    public function scopeByTags($query, array $tags)
    {
        return $query->where(function ($q) use ($tags) {
            foreach ($tags as $tag) {
                $q->orWhereJsonContains('tags', mb_strtolower($tag));
            }
        });
    }

    public function scopeHighQuality($query, int $minScore = 70)
    {
        return $query->where('quality_score', '>=', $minScore);
    }

    public function scopeLandscape($query)
    {
        return $query->whereNotNull('width')
            ->whereNotNull('height')
            ->whereRaw('width > height');
    }

    public function scopeMinResolution($query, int $minWidth = 800)
    {
        return $query->where('width', '>=', $minWidth);
    }

    /**
     * Get the best available URL for display.
     */
    public function getDisplayUrl(string $size = 'regular'): string
    {
        return match ($size) {
            'thumb' => $this->thumb_url ?? $this->small_url ?? $this->public_url ?? '',
            'small' => $this->small_url ?? $this->public_url ?? '',
            default => $this->public_url ?? $this->original_url ?? '',
        };
    }

    /**
     * Record that this image was used in content.
     */
    public function recordUsage(string $contentType, string $contentId): void
    {
        $usedIn = $this->used_in ?? [];
        $usedIn[] = [
            'type' => $contentType,
            'id' => $contentId,
            'used_at' => now()->toIso8601String(),
        ];

        $this->update([
            'usage_count' => $this->usage_count + 1,
            'last_used_at' => now(),
            'used_in' => $usedIn,
        ]);
    }

    /**
     * Check if this image meets minimum quality for article use.
     */
    public function isUsableForArticle(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }
        if (! $this->is_approved) {
            return false;
        }
        if ($this->width && $this->width < 600) {
            return false;
        }
        if ($this->quality_score !== null && $this->quality_score < 40) {
            return false;
        }

        return true;
    }

    /**
     * Convert to array format expected by article generation (draft/post update).
     *
     * @return array{url: string, storage_path: string|null, storage_disk: string|null, attribution: string|null, photographer_name: string|null, alt_description: string|null, media_asset_id: string}
     */
    public function toArticleImageData(): array
    {
        return [
            'url' => $this->getDisplayUrl(),
            'storage_path' => $this->storage_path,
            'storage_disk' => $this->storage_disk,
            'attribution' => $this->attribution_html,
            'photographer_name' => $this->photographer_name,
            'alt_description' => $this->alt_text,
            'media_asset_id' => $this->id,
        ];
    }

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'ai_tags' => 'array',
            'raw_attributions' => 'array',
            'used_in' => 'array',
            'requires_attribution' => 'boolean',
            'is_approved' => 'boolean',
            'is_featured' => 'boolean',
            'is_local' => 'boolean',
            'last_used_at' => 'datetime',
            'width' => 'integer',
            'height' => 'integer',
            'file_size_bytes' => 'integer',
            'quality_score' => 'integer',
            'usage_count' => 'integer',
        ];
    }
}

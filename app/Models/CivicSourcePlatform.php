<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Civic Source Platform Model
 * 
 * Represents a civic technology platform (CivicPlus, Legistar, Nixle)
 */
class CivicSourcePlatform extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'api_base_url',
        'detection_patterns',
        'default_config',
        'is_active',
    ];

    protected $casts = [
        'detection_patterns' => 'array',
        'default_config' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Platform name constants
     */
    public const CIVICPLUS = 'civicplus';
    public const LEGISTAR = 'legistar';
    public const NIXLE = 'nixle';

    /**
     * Get all civic sources using this platform
     */
    public function sources(): HasMany
    {
        return $this->hasMany(CivicSource::class, 'platform_id');
    }

    /**
     * Get active sources for this platform
     */
    public function activeSources(): HasMany
    {
        return $this->sources()->where('is_enabled', true);
    }

    /**
     * Scope to only active platforms
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get platform by name
     */
    public static function byName(string $name): ?self
    {
        return static::where('name', $name)->first();
    }

    /**
     * Check if URL matches this platform's patterns
     */
    public function matchesUrl(string $url): bool
    {
        $patterns = $this->detection_patterns['url_patterns'] ?? [];
        
        foreach ($patterns as $pattern) {
            if (stripos($url, $pattern) !== false) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if HTML content matches this platform's signatures
     */
    public function matchesHtml(string $html): bool
    {
        $signatures = $this->detection_patterns['html_signatures'] ?? [];
        $htmlLower = strtolower($html);
        
        foreach ($signatures as $signature) {
            if (stripos($htmlLower, $signature) !== false) {
                return true;
            }
        }
        
        return false;
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

final class WriterAgent extends Model
{
    /** @use HasFactory<\Database\Factories\WriterAgentFactory> */
    use HasFactory, HasUuid;

    public const STYLE_FORMAL = 'formal';

    public const STYLE_CASUAL = 'casual';

    public const STYLE_INVESTIGATIVE = 'investigative';

    public const STYLE_CONVERSATIONAL = 'conversational';

    public const WRITING_STYLES = [
        self::STYLE_FORMAL,
        self::STYLE_CASUAL,
        self::STYLE_INVESTIGATIVE,
        self::STYLE_CONVERSATIONAL,
    ];

    protected $fillable = [
        'name',
        'slug',
        'bio',
        'avatar',
        'writing_style',
        'persona_traits',
        'expertise_areas',
        'categories',
        'prompts',
        'articles_count',
        'is_active',
    ];

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'writer_agent_region')
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function posts(): HasMany
    {
        return $this->hasMany(DayNewsPost::class);
    }

    /**
     * Get the primary region for this agent.
     */
    public function getPrimaryRegionAttribute(): ?Region
    {
        return $this->regions()->wherePivot('is_primary', true)->first();
    }

    /**
     * Generate a DiceBear avatar URL for this agent.
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return $this->avatar;
        }

        $seed = urlencode($this->name ?? $this->id);

        return "https://api.dicebear.com/7.x/personas/svg?seed={$seed}";
    }

    /**
     * Get the system prompt for article generation.
     */
    public function getSystemPromptAttribute(): ?string
    {
        return $this->prompts['system_prompt'] ?? null;
    }

    /**
     * Get the style instructions for article generation.
     */
    public function getStyleInstructionsAttribute(): ?string
    {
        return $this->prompts['style_instructions'] ?? null;
    }

    /**
     * Check if the agent handles a specific category.
     *
     * @param  array<string>|string  $categories
     */
    public function handlesCategory(array|string $categories): bool
    {
        $categoryArray = is_array($categories) ? $categories : [$categories];

        return count(array_intersect($this->categories ?? [], $categoryArray)) > 0;
    }

    /**
     * Check if the agent covers a specific region.
     */
    public function coversRegion(string $regionId): bool
    {
        return $this->regions()->where('regions.id', $regionId)->exists();
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('regions.id', $regionId);
        });
    }

    public function scopeForCategory($query, string $category)
    {
        return $query->whereJsonContains('categories', $category);
    }

    public function scopeByWritingStyle($query, string $style)
    {
        return $query->where('writing_style', $style);
    }

    protected static function booted(): void
    {
        self::creating(function (WriterAgent $agent): void {
            if (empty($agent->slug)) {
                $agent->slug = static::generateUniqueSlug($agent->name);
            }

            if (empty($agent->avatar)) {
                $seed = urlencode($agent->name ?? Str::uuid()->toString());
                $agent->avatar = "https://api.dicebear.com/7.x/personas/svg?seed={$seed}";
            }
        });
    }

    protected static function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        return $slug;
    }

    protected function casts(): array
    {
        return [
            'persona_traits' => 'array',
            'expertise_areas' => 'array',
            'categories' => 'array',
            'prompts' => 'array',
            'articles_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}

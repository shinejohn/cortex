<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class ClassifiedCategory extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'icon',
        'display_order',
        'is_active',
    ];

    /**
     * Get the parent category.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Get the child categories.
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('display_order');
    }

    /**
     * Get the classifieds in this category.
     */
    public function classifieds(): HasMany
    {
        return $this->hasMany(Classified::class);
    }

    /**
     * Get the predefined specifications for this category.
     */
    public function specifications(): HasMany
    {
        return $this->hasMany(ClassifiedSpecification::class)->orderBy('display_order');
    }

    /**
     * Get all specifications including parent category specs.
     *
     * @return \Illuminate\Support\Collection<int, ClassifiedSpecification>
     */
    public function getAllSpecifications(): \Illuminate\Support\Collection
    {
        $specs = $this->specifications;

        if ($this->parent) {
            $specs = $specs->merge($this->parent->getAllSpecifications());
        }

        return $specs->sortBy('display_order');
    }

    /**
     * Scope to filter active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter top-level categories (no parent).
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Check if this category has children.
     */
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    /**
     * Check if this is a top-level category.
     */
    public function isTopLevel(): bool
    {
        return $this->parent_id === null;
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class OrganizationHierarchy extends Model
{
    /** @use HasFactory<\Database\Factories\OrganizationHierarchyFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'organization_id',
        'parent_id',
        'level',
        'path',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'organization_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'parent_id');
    }

    // Scopes
    public function scopeByLevel($query, int $level)
    {
        return $query->where('level', $level);
    }

    public function scopeRoots($query)
    {
        return $query->where('level', 0)->whereNull('parent_id');
    }

    protected function casts(): array
    {
        return [
            'level' => 'integer',
        ];
    }
}


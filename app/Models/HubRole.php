<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class HubRole extends Model
{
    /** @use HasFactory<\Database\Factories\HubRoleFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'hub_id',
        'name',
        'slug',
        'description',
        'permissions',
        'is_system',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'is_system' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function hub(): BelongsTo
    {
        return $this->belongsTo(Hub::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(HubMember::class, 'role', 'slug');
    }
}


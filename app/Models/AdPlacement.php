<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class AdPlacement extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'slot',
        'name',
        'description',
        'format',
        'width',
        'height',
        'base_cpm',
        'base_cpc',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'base_cpm' => 'decimal:2',
        'base_cpc' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function inventory(): HasMany
    {
        return $this->hasMany(AdInventory::class, 'placement_id');
    }

    public function impressions(): HasMany
    {
        return $this->hasMany(AdImpression::class, 'placement_id');
    }
}

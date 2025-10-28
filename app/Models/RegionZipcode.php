<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class RegionZipcode extends Model
{
    /** @use HasFactory<\Database\Factories\RegionZipcodeFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'region_id',
        'zipcode',
        'is_primary',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    // Scopes
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeForZipcode($query, string $zipcode)
    {
        return $query->where('zipcode', $zipcode);
    }

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }
}

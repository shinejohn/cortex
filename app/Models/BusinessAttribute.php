<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BusinessAttribute extends Model
{
    /** @use HasFactory<\Database\Factories\BusinessAttributeFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'smb_business_id',
        'attribute_key',
        'attribute_value',
        'attribute_type',
    ];

    protected function casts(): array
    {
        return [
            'attribute_value' => match ($this->attribute_type) {
                'array' => 'array',
                'boolean' => 'boolean',
                default => 'string',
            },
        ];
    }

    public function smbBusiness(): BelongsTo
    {
        return $this->belongsTo(SmbBusiness::class);
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BusinessPhoto extends Model
{
    /** @use HasFactory<\Database\Factories\BusinessPhotoFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'smb_business_id',
        'photo_reference',
        'width',
        'height',
        'html_attributions',
        'is_primary',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'html_attributions' => 'array',
            'is_primary' => 'boolean',
        ];
    }

    public function smbBusiness(): BelongsTo
    {
        return $this->belongsTo(SmbBusiness::class);
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BusinessReview extends Model
{
    /** @use HasFactory<\Database\Factories\BusinessReviewFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'smb_business_id',
        'author_name',
        'author_url',
        'language',
        'profile_photo_url',
        'rating',
        'relative_time_description',
        'text',
        'time',
    ];

    protected function casts(): array
    {
        return [
            'time' => 'datetime',
        ];
    }

    public function smbBusiness(): BelongsTo
    {
        return $this->belongsTo(SmbBusiness::class);
    }

    public function isPositive(): bool
    {
        return $this->rating >= 4;
    }

    public function isNegative(): bool
    {
        return $this->rating <= 2;
    }
}

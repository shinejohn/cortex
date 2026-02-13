<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PhotoContribution extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'business_id',
        'url',
        'caption',
        'contributor',
        'approved',
        'contributed_at',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('approved', true);
    }

    protected function casts(): array
    {
        return [
            'approved' => 'boolean',
            'contributed_at' => 'datetime',
        ];
    }
}

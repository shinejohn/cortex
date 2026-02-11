<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

final class LegalNotice extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'workspace_id',
        'type',
        'case_number',
        'title',
        'content',
        'court',
        'publish_date',
        'expiry_date',
        'status',
        'metadata',
        'views_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'legal_notice_region')
            ->withTimestamps();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now()->toDateString());
            });
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('region_id', $regionId);
        });
    }

    public function scopeExpiresSoon($query)
    {
        return $query->where('expiry_date', '>=', now()->toDateString())
            ->where('expiry_date', '<=', now()->addDays(7)->toDateString());
    }

    public function incrementViewsCount(): void
    {
        $this->increment('views_count');
    }

    public function isExpired(): bool
    {
        return $this->expiry_date !== null && $this->expiry_date->isPast();
    }

    protected function casts(): array
    {
        return [
            'publish_date' => 'date',
            'expiry_date' => 'date',
            'metadata' => 'array',
            'views_count' => 'integer',
        ];
    }
}

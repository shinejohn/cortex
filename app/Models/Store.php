<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Store extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'name',
        'slug',
        'description',
        'logo',
        'banner',
        'status',
        'rejection_reason',
        'approved_at',
    ];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function canAcceptPayments(): bool
    {
        return $this->isApproved() && $this->workspace->canAcceptPayments();
    }

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }
}

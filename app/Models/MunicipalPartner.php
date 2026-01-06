<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

final class MunicipalPartner extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'type',
        'community_ids',
        'primary_contact_id',
        'api_key_hash',
        'is_verified',
        'is_active',
        'allowed_categories',
        'allowed_priorities',
        'requires_approval',
    ];

    protected $casts = [
        'community_ids' => 'array',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'allowed_categories' => 'array',
        'allowed_priorities' => 'array',
        'requires_approval' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model): void {
            $model->uuid = $model->uuid ?? Str::uuid()->toString();
        });
    }

    public function primaryContact(): BelongsTo
    {
        return $this->belongsTo(User::class, 'primary_contact_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(EmergencyAlert::class, 'municipal_partner_id');
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class SalesOpportunity extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'region_id',
        'business_id',
        'source_type',
        'source_id',
        'opportunity_type',
        'priority_score',
        'status',
        'business_name',
        'business_contact_email',
        'business_contact_phone',
        'trigger_description',
        'recommended_action',
        'suggested_script',
        'suggested_products',
        'assigned_to',
        'assigned_at',
        'first_contact_at',
        'last_contact_at',
        'contact_attempts',
        'notes',
        'deal_value',
        'resulting_order_id',
    ];

    protected $casts = [
        'suggested_products' => 'array',
        'assigned_at' => 'datetime',
        'first_contact_at' => 'datetime',
        'last_contact_at' => 'datetime',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(SalesOpportunityActivity::class, 'opportunity_id');
    }
}

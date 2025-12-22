<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class SMBCrmCustomer extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $table = 'smb_crm_customers';

    protected $fillable = [
        'business_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'source',
        'source_details',
        'status',
        'customer_since',
        'last_interaction_at',
        'health_score',
        'lifetime_value',
        'predicted_churn_risk',
        'ai_notes',
        'preferences',
        'tags',
    ];

    protected function casts(): array
    {
        return [
            'source_details' => 'array',
            'customer_since' => 'date',
            'last_interaction_at' => 'datetime',
            'lifetime_value' => 'decimal:2',
            'predicted_churn_risk' => 'decimal:4',
            'preferences' => 'array',
            'tags' => 'array',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(SMBCrmInteraction::class, 'customer_id');
    }

    public function surveyResponses(): HasMany
    {
        return $this->hasMany(BusinessSurveyResponse::class, 'customer_id');
    }
}

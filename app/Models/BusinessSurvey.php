<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class BusinessSurvey extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'business_surveys';

    protected $fillable = [
        'business_id',
        'name',
        'description',
        'survey_type',
        'questions',
        'trigger_type',
        'trigger_config',
        'is_active',
        'responses_count',
        'average_score',
    ];

    protected function casts(): array
    {
        return [
            'questions' => 'array',
            'trigger_config' => 'array',
            'is_active' => 'boolean',
            'average_score' => 'decimal:2',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(BusinessSurveyResponse::class, 'survey_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

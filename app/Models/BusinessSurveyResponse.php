<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BusinessSurveyResponse extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'business_survey_responses';

    public $timestamps = true;
    protected $dateFormat = 'U';

    protected $fillable = [
        'survey_id',
        'business_id',
        'customer_id',
        'responses',
        'overall_score',
        'sentiment',
        'ai_summary',
        'action_items',
        'completed_at',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'responses' => 'array',
            'overall_score' => 'decimal:2',
            'action_items' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    public function survey(): BelongsTo
    {
        return $this->belongsTo(BusinessSurvey::class, 'survey_id');
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(SMBCrmCustomer::class, 'customer_id');
    }
}

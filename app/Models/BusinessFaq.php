<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BusinessFaq extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'business_faqs';

    protected $fillable = [
        'business_id',
        'question',
        'answer',
        'category',
        'tags',
        'variations',
        'follow_up_questions',
        'times_used',
        'helpful_votes',
        'unhelpful_votes',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'variations' => 'array',
            'follow_up_questions' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

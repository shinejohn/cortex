<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CityCategoryContent extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'city_category_content';

    protected $fillable = [
        'city_id',
        'category_id',
        'seo_title',
        'seo_description',
        'ai_intro',
        'ai_hiring_guide',
        'ai_local_insights',
        'ai_cost_guide',
        'ai_faqs',
        'ai_tips',
        'business_count',
        'content_generated_at',
        'business_count_updated_at',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AlphasiteCategory::class, 'category_id');
    }

    public function businesses(): Builder
    {
        return Business::where('city_id', $this->city_id)
            ->where('category_id', $this->category_id);
    }

    public function hasContent(): bool
    {
        return $this->content_generated_at !== null;
    }

    protected function casts(): array
    {
        return [
            'ai_faqs' => 'array',
            'ai_tips' => 'array',
            'business_count' => 'integer',
            'content_generated_at' => 'datetime',
            'business_count_updated_at' => 'datetime',
        ];
    }
}

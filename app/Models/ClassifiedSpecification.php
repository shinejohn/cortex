<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class ClassifiedSpecification extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'classified_category_id',
        'name',
        'key',
        'type',
        'options',
        'is_required',
        'display_order',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ClassifiedCategory::class, 'classified_category_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(ClassifiedSpecificationValue::class);
    }

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'is_required' => 'boolean',
            'display_order' => 'integer',
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ClassifiedSpecificationValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'classified_id',
        'classified_specification_id',
        'value',
    ];

    public function classified(): BelongsTo
    {
        return $this->belongsTo(Classified::class);
    }

    public function specification(): BelongsTo
    {
        return $this->belongsTo(ClassifiedSpecification::class, 'classified_specification_id');
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ClassifiedCustomAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'classified_id',
        'key',
        'value',
    ];

    public function classified(): BelongsTo
    {
        return $this->belongsTo(Classified::class);
    }
}

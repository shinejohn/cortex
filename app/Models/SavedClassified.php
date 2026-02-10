<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SavedClassified extends Model
{
    use HasFactory;

    protected $fillable = [
        'classified_id',
        'user_id',
    ];

    public function classified(): BelongsTo
    {
        return $this->belongsTo(Classified::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

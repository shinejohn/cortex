<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class UserPoints extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'points_balance',
        'lifetime_points',
        'current_level',
        'level_progress',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

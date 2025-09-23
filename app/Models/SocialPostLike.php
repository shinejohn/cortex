<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SocialPostLike extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(SocialPost::class, 'post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SocialCommentLike extends Model
{
    use HasFactory;

    protected $fillable = [
        'comment_id',
        'user_id',
    ];

    public function comment(): BelongsTo
    {
        return $this->belongsTo(SocialPostComment::class, 'comment_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

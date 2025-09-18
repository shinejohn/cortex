<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CommunityThreadReplyLike extends Model
{
    /** @use HasFactory<\Database\Factories\CommunityThreadReplyLikeFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'reply_id',
        'user_id',
    ];

    public function reply(): BelongsTo
    {
        return $this->belongsTo(CommunityThreadReply::class, 'reply_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

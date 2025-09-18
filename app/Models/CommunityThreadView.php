<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CommunityThreadView extends Model
{
    /** @use HasFactory<\Database\Factories\CommunityThreadViewFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'thread_id',
        'user_id',
        'session_id',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function thread(): BelongsTo
    {
        return $this->belongsTo(CommunityThread::class, 'thread_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

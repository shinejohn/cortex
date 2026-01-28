<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class PollDiscussion extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'poll_id',
        'user_id',
        'parent_id',
        'content',
        'likes_count',
        'is_flagged',
        'is_hidden',
    ];

    protected $casts = [
        'is_flagged' => 'boolean',
        'is_hidden' => 'boolean',
    ];

    public function poll(): BelongsTo
    {
        return $this->belongsTo(Poll::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(PollDiscussion::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(PollDiscussion::class, 'parent_id');
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CommentReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'comment_id',
        'user_id',
        'reason',
        'details',
        'status',
    ];

    public function comment(): BelongsTo
    {
        return $this->belongsTo(ArticleComment::class, 'comment_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'status' => 'string',
        ];
    }
}


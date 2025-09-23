<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

final class SocialGroupPost extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'group_id',
        'user_id',
        'content',
        'media',
        'is_pinned',
        'is_active',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(SocialGroup::class, 'group_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(SocialActivity::class, 'subject');
    }

    protected function casts(): array
    {
        return [
            'media' => 'array',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}

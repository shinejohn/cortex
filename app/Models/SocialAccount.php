<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SocialAccount extends Model
{
    use HasUuid;

    protected $fillable = [
        'user_id',
        'provider',
        'provider_id',
        'name',
        'token',
        'refresh_token',
        'avatar',
        'code',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'token' => 'encrypted',
        'refresh_token' => 'encrypted',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getAvatarAttribute(): string
    {
        return $this->avatar ?? "https://api.dicebear.com/9.x/glass/svg?seed={$this->user->id}";
    }
}

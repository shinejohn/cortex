<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SocialUserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'website',
        'location',
        'birth_date',
        'profile_visibility',
        'interests',
        'cover_photo',
        'social_links',
        'show_email',
        'show_location',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isPublic(): bool
    {
        return $this->profile_visibility === 'public';
    }

    public function isFriendsOnly(): bool
    {
        return $this->profile_visibility === 'friends';
    }

    public function isPrivate(): bool
    {
        return $this->profile_visibility === 'private';
    }

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'interests' => 'array',
            'social_links' => 'array',
            'show_email' => 'boolean',
            'show_location' => 'boolean',
        ];
    }
}

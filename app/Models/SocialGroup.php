<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class SocialGroup extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'description',
        'cover_image',
        'creator_id',
        'privacy',
        'is_active',
        'settings',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(SocialGroupMember::class, 'group_id');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(SocialGroupPost::class, 'group_id');
    }

    public function approvedMembers(): HasMany
    {
        return $this->members()->where('status', 'approved');
    }

    public function admins(): HasMany
    {
        return $this->members()->where('role', 'admin')->where('status', 'approved');
    }

    public function membersCount(): int
    {
        return $this->approvedMembers()->count();
    }

    public function isPublic(): bool
    {
        return $this->privacy === 'public';
    }

    public function isPrivate(): bool
    {
        return $this->privacy === 'private';
    }

    public function isSecret(): bool
    {
        return $this->privacy === 'secret';
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Role extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
    ];

    protected $appends = [
        'permissions',
    ];

    public function memberships(): HasMany
    {
        return $this->hasMany(WorkspaceMembership::class);
    }

    public function getPermissionsAttribute(): array
    {
        return config('makerkit.workspaces.roles.'.mb_strtolower($this->name).'.permissions', []);
    }
}

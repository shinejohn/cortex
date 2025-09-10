<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Climactic\Credits\Traits\HasCredits;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Workspace extends Model
{
    use HasCredits, HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'owner_id',
    ];

    public function getLogoAttribute($value)
    {
        return "https://api.dicebear.com/9.x/glass/svg?seed={$this->id}";
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(WorkspaceMembership::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(WorkspaceInvitation::class);
    }
}

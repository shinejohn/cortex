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
        'stripe_connect_id',
        'stripe_charges_enabled',
        'stripe_payouts_enabled',
        'stripe_admin_approved',
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

    public function stores(): HasMany
    {
        return $this->hasMany(Store::class);
    }

    public function canAcceptPayments(): bool
    {
        return $this->stripe_charges_enabled
            && $this->stripe_payouts_enabled
            && $this->stripe_connect_id
            && $this->stripe_admin_approved;
    }

    protected function casts(): array
    {
        return [
            'stripe_charges_enabled' => 'boolean',
            'stripe_payouts_enabled' => 'boolean',
            'stripe_admin_approved' => 'boolean',
        ];
    }
}

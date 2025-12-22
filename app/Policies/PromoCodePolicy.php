<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\PromoCode;
use App\Models\User;

final class PromoCodePolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Public listing of active codes
    }

    public function view(?User $user, PromoCode $promoCode): bool
    {
        return true; // Promo codes are publicly viewable
    }

    public function create(User $user): bool
    {
        // Only admins can create promo codes
        return $user->canAccessPanel(\Filament\Facades\Filament::getPanel('admin'));
    }

    public function update(User $user, PromoCode $promoCode): bool
    {
        // Only admins can update promo codes
        return $user->canAccessPanel(\Filament\Facades\Filament::getPanel('admin'));
    }

    public function delete(User $user, PromoCode $promoCode): bool
    {
        // Only admins can delete promo codes
        return $user->canAccessPanel(\Filament\Facades\Filament::getPanel('admin'));
    }
}

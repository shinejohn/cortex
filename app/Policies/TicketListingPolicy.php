<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\TicketListing;
use App\Models\User;

final class TicketListingPolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Public marketplace
    }

    public function view(?User $user, TicketListing $listing): bool
    {
        return true; // Listings are publicly viewable
    }

    public function create(User $user): bool
    {
        return true; // Any user can list tickets
    }

    public function update(User $user, TicketListing $listing): bool
    {
        return $listing->seller_id === $user->id;
    }

    public function delete(User $user, TicketListing $listing): bool
    {
        return $listing->seller_id === $user->id;
    }
}

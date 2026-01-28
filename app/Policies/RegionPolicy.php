<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Region;
use App\Models\User;

final class RegionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Region $region): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Region $region): bool
    {
        return true;
    }

    public function delete(User $user, Region $region): bool
    {
        return true;
    }
}

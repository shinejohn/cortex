<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\NotificationSubscription;
use App\Models\User;

final class NotificationSubscriptionPolicy
{
    /**
     * Determine if the user can update the subscription
     */
    public function update(User $user, NotificationSubscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    /**
     * Determine if the user can delete the subscription
     */
    public function delete(User $user, NotificationSubscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }
}

<?php

declare(strict_types=1);

namespace App\Listeners\EventCity;

use App\Events\EventCity\AgentRegistered;
use App\Notifications\EventCity\AgentRegisteredNotification;

final class SendAgentWelcomeNotification
{
    public function handle(AgentRegistered $event): void
    {
        $event->agent->user->notify(new AgentRegisteredNotification($event->agent));
    }
}

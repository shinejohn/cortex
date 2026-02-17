<?php

declare(strict_types=1);

namespace App\Listeners\EventCity;

use App\Events\EventCity\ClientAuthorized;
use Illuminate\Support\Facades\Log;

final class SendClientAuthorizationNotification
{
    public function handle(ClientAuthorized $event): void
    {
        Log::info('Client authorized', [
            'agent_id' => $event->client->booking_agent_id,
            'client_user_id' => $event->client->user_id,
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Listeners\EventCity;

use App\Events\EventCity\TipReceived;
use App\Notifications\EventCity\TipReceivedNotification;

final class SendTipReceivedNotification
{
    public function handle(TipReceived $event): void
    {
        $performer = $event->tip->performer;
        $user = $performer->createdBy;

        if ($user) {
            $user->notify(new TipReceivedNotification($event->tip));
        }
    }
}

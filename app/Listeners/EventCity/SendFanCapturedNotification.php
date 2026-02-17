<?php

declare(strict_types=1);

namespace App\Listeners\EventCity;

use App\Events\EventCity\FanCaptured;
use App\Notifications\EventCity\FanCapturedNotification;

final class SendFanCapturedNotification
{
    public function handle(FanCaptured $event): void
    {
        $performer = $event->fan->performer;
        $user = $performer->createdBy;

        if ($user) {
            $user->notify(new FanCapturedNotification($event->fan));
        }
    }
}

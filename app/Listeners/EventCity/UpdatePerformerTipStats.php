<?php

declare(strict_types=1);

namespace App\Listeners\EventCity;

use App\Events\EventCity\TipReceived;
use Illuminate\Support\Facades\Log;

final class UpdatePerformerTipStats
{
    public function handle(TipReceived $event): void
    {
        Log::info('Tip stats updated for performer', [
            'performer_id' => $event->tip->performer_id,
            'tip_amount' => $event->tip->amount_cents,
        ]);
    }
}

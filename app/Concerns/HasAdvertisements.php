<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\Advertisement;
use App\Models\AdvertisementPayment;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasAdvertisements
{
    public function advertisements(): MorphMany
    {
        return $this->morphMany(Advertisement::class, 'advertable');
    }

    public function advertisementPayments(): MorphMany
    {
        return $this->morphMany(AdvertisementPayment::class, 'payable');
    }

    public function activeAdvertisement(): ?Advertisement
    {
        return $this->advertisements()
            ->active()
            ->first();
    }

    public function hasActiveAd(): bool
    {
        return $this->advertisements()
            ->active()
            ->exists();
    }

    public function pendingAdvertisementPayment(): ?AdvertisementPayment
    {
        return $this->advertisementPayments()
            ->pending()
            ->latest()
            ->first();
    }
}

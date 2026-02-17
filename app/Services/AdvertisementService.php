<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Advertisement;
use App\Models\Region;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

final class AdvertisementService
{
    public function createAdvertisement(Model $advertable, string $platform, array $config): Advertisement
    {
        $type = $config['type'] ?? 'local';

        return Advertisement::create([
            'type' => $type,
            'external_code' => $type === 'google' ? ($config['external_code'] ?? null) : null,
            'config' => $config['config'] ?? null,
            'advertable_type' => get_class($advertable),
            'advertable_id' => $advertable->id,
            'platform' => $platform,
            'placement' => $config['placement'] ?? 'sidebar',
            'regions' => $config['regions'] ?? [],
            'starts_at' => $config['starts_at'] ?? now(),
            'expires_at' => $config['expires_at'],
            'is_active' => true,
        ]);
    }

    public function getActiveAds(string $platform, ?Region $region = null, string $placement = 'sidebar'): Collection
    {
        $query = Advertisement::active()
            ->forPlatform($platform)
            ->forPlacement($placement)
            ->with('advertable');

        if ($region) {
            $query->forRegion($region->id);
        }

        return $query->inRandomOrder()->get();
    }

    public function trackImpression(Advertisement $ad): void
    {
        $ad->incrementImpressions();
    }

    public function trackClick(Advertisement $ad): void
    {
        $ad->incrementClicks();
    }

    public function expireExpiredAds(): int
    {
        return Advertisement::where('is_active', true)
            ->where('expires_at', '<=', now())
            ->update(['is_active' => false]);
    }

    public function deactivateAd(Advertisement $ad): void
    {
        $ad->markAsInactive();
    }
}

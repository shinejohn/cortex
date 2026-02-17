<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Events\EventCity\FanCaptured;
use App\Events\EventCity\FanConvertedToUser;
use App\Models\Fan;
use App\Models\Performer;
use App\Models\User;

final class FanCaptureService
{
    /**
     * Capture or find an existing fan for a performer
     */
    public function captureOrFindFan(Performer $performer, array $data): Fan
    {
        $fan = Fan::where('performer_id', $performer->id)
            ->where('email', $data['email'])
            ->first();

        if ($fan) {
            $fan->update(['last_interaction_at' => now()]);

            return $fan;
        }

        $fan = Fan::create([
            'performer_id' => $performer->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'source' => $data['source'] ?? 'landing_page',
            'last_interaction_at' => now(),
            'metadata' => $data['metadata'] ?? null,
        ]);

        $performer->increment('total_fans_captured');

        event(new FanCaptured($fan));

        return $fan;
    }

    /**
     * Convert a fan to a registered user
     */
    public function convertFanToUser(Fan $fan, User $user): Fan
    {
        $fan->update([
            'user_id' => $user->id,
            'converted_to_user_at' => now(),
        ]);

        event(new FanConvertedToUser($fan));

        return $fan;
    }

    /**
     * Get fan list for a performer
     */
    public function getFanList(Performer $performer, ?string $source = null, int $perPage = 25)
    {
        $query = $performer->fans()->with('user')->latest('last_interaction_at');

        if ($source) {
            $query->bySource($source);
        }

        return $query->paginate($perPage);
    }

    /**
     * Export fans as CSV data
     */
    public function exportFansCsv(Performer $performer): string
    {
        $fans = $performer->fans()->orderBy('name')->get();

        $csv = "Name,Email,Phone,Source,Tips,Total Given,First Seen,Converted\n";

        foreach ($fans as $fan) {
            $csv .= implode(',', [
                '"'.str_replace('"', '""', $fan->name).'"',
                $fan->email,
                $fan->phone ?? '',
                $fan->source,
                $fan->tip_count,
                number_format($fan->total_tips_given_cents / 100, 2),
                $fan->created_at->toDateString(),
                $fan->isConverted() ? 'Yes' : 'No',
            ])."\n";
        }

        return $csv;
    }
}

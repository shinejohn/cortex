<?php

namespace App\Services\Newsroom;

use App\Models\Business;
use Illuminate\Support\Facades\Cache;

class BusinessMatchingService
{
    public function findMatch(string $name, int $communityId): ?Business
    {
        $normalized = $this->normalize($name);
        
        // Exact match
        if ($exact = Business::where('community_id', $communityId)->whereRaw('LOWER(name) = ?', [strtolower($name)])->first()) {
            return $exact;
        }

        // Fuzzy match
        $businesses = Cache::remember("businesses_{$communityId}", 3600, fn() => 
            Business::where('community_id', $communityId)->get(['id', 'name', 'is_advertiser', 'is_command_center_customer'])->toArray()
        );

        $best = null;
        $bestScore = 0;

        foreach ($businesses as $b) {
            similar_text($this->normalize($b['name']), $normalized, $score);
            if ($score > 85 && $score > $bestScore) {
                $best = Business::find($b['id']);
                $bestScore = $score;
            }
        }

        return $best;
    }

    public function normalize(string $name): string
    {
        $name = strtolower($name);
        $name = preg_replace('/\s+(inc|llc|ltd|corp|co|company)\.?$/i', '', $name);
        $name = preg_replace('/[^\w\s]/', '', $name);
        return trim(preg_replace('/\s+/', ' ', $name));
    }
}

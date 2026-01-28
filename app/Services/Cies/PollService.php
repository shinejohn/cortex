<?php

declare(strict_types=1);

namespace App\Services\Cies;

use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\Region;
use App\Models\User;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class PollService
{
    /**
     * Create a new poll
     */
    public function createPoll(array $data): Poll
    {
        return DB::transaction(function () use ($data) {
            $data['slug'] = $data['slug'] ?? Str::slug($data['title']);

            // Create the poll
            $poll = Poll::create(\Illuminate\Support\Arr::except($data, ['options']));

            // Create options if provided
            if (!empty($data['options'])) {
                foreach ($data['options'] as $index => $optionData) {
                    $optionData['poll_id'] = $poll->id;
                    $optionData['display_order'] = $index;
                    PollOption::create($optionData);
                }
            }

            return $poll->load('options');
        });
    }

    /**
     * Cast a vote
     */
    public function castVote(Poll $poll, PollOption $option, ?User $user, string $ip, ?string $fingerprint): array
    {
        // 1. Validation checks
        if (!$poll->is_active) {
            throw new Exception("This poll is not currently active.");
        }

        if ($poll->require_login_to_vote && !$user) {
            throw new Exception("You must be logged in to vote.");
        }

        // 2. Check duplicate votes
        $query = PollVote::where('poll_id', $poll->id);

        if ($user) {
            $query->where('user_id', $user->id);
        } else {
            // Anonymous voting limits
            $query->where(function ($q) use ($ip, $fingerprint) {
                $q->where('voter_ip', $ip);
                if ($fingerprint) {
                    $q->orWhere('voter_fingerprint', $fingerprint);
                }
            });
        }

        $existingVotes = $query->count();

        if ($existingVotes >= $poll->max_votes_per_user) {
            throw new Exception("You have already voted in this poll.");
        }

        return DB::transaction(function () use ($poll, $option, $user, $ip, $fingerprint) {
            // 3. Record vote
            PollVote::create([
                'poll_id' => $poll->id,
                'option_id' => $option->id,
                'user_id' => $user?->id,
                'voter_ip' => $ip,
                'voter_fingerprint' => $fingerprint,
                'voted_at' => now(),
            ]);

            // 4. Update counts
            $option->increment('vote_count');
            $poll->increment('total_votes');
            $poll->increment('total_participants'); // Simplified, assumes 1 vote per person usually

            return [
                'success' => true,
                'poll' => $poll->refresh()->load('options'),
            ];
        });
    }

    /**
     * Get polls for a region
     */
    public function getActivePollsForRegion(Region $region): Collection
    {
        return Poll::where('region_id', $region->id)
            ->where('is_active', true)
            ->where('voting_ends_at', '>', now())
            ->with('options')
            ->orderBy('voting_ends_at', 'asc')
            ->get();
    }
}

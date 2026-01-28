<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Poll;
use App\Models\PollVote;
use App\Services\Cies\PollService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PollPageController extends Controller
{
    public function __construct(
        private readonly PollService $pollService
    ) {
    }

    public function show(Request $request, string $slug): Response
    {
        $poll = Poll::where('slug', $slug)
            ->with(['options', 'region'])
            ->firstOrFail();

        // Check if user has voted
        $userVoted = false;
        $votedOptionId = null;

        if ($request->user()) {
            $vote = PollVote::where('poll_id', $poll->id)
                ->where('user_id', $request->user()->id)
                ->first();

            if ($vote) {
                $userVoted = true;
                $votedOptionId = $vote->option_id;
            }
        } else {
            // Check cookie/IP for anonymous voting
            // Determining previous vote via IP is unreliable for "hasVoted" UI state 
            // but checked during submission.
        }

        return Inertia::render('Polls/Show', [
            'poll' => $poll,
            'hasVoted' => $userVoted,
            'userVotedOptionId' => $votedOptionId,
            'canVote' => $poll->is_active && $poll->voting_ends_at->isFuture(),
            'directLink' => route('poll.show', $slug),
            'embedCode' => sprintf('<iframe src="%s" width="100%%" height="600" frameborder="0"></iframe>', route('poll.embed', $slug)),
        ]);
    }

    public function vote(Request $request, string $slug)
    {
        $poll = Poll::where('slug', $slug)->firstOrFail();

        $request->validate([
            'option_id' => 'required|exists:poll_options,id',
        ]);

        try {
            // Add fingerprint to request if provided by frontend
            $fingerprint = $request->input('fingerprint');
            $option = $poll->options()->find($request->input('option_id'));

            $result = $this->pollService->castVote(
                $poll,
                $option,
                $request->user(),
                $request->ip(),
                $fingerprint
            );

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    public function embed(string $slug): Response
    {
        $poll = Poll::where('slug', $slug)
            ->with(['options'])
            ->firstOrFail();

        return Inertia::render('Polls/Embed', [
            'poll' => $poll,
            'directLink' => route('poll.show', $slug),
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\Poll;
use App\Models\PollOption;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

final class PollSolicitationService
{
    /**
     * Email featured businesses during voting period: "Your business was nominated — share the poll."
     */
    public function solicitForPoll(Poll $poll): array
    {
        $stats = ['sent' => 0, 'skipped' => 0];

        $options = $poll->options()->with('business')->get();
        $pollUrl = route('poll.show', $poll->slug);

        foreach ($options as $option) {
            $business = $option->business;
            $email = $business?->email ?? null;
            if (! $email || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $stats['skipped']++;

                continue;
            }

            try {
                $body = $this->buildSolicitationEmail($poll, $option, $pollUrl);
                Mail::raw($body, function ($message) use ($email, $poll) {
                    $message->to($email)
                        ->subject("You're nominated! Share the poll: {$poll->title}")
                        ->from(config('mail.from.address'), config('mail.from.name'));
                });
                $stats['sent']++;
            } catch (Exception $e) {
                Log::error('PollSolicitation: Send failed', [
                    'poll_id' => $poll->id,
                    'option_id' => $option->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $stats;
    }

    private function buildSolicitationEmail(Poll $poll, PollOption $option, string $pollUrl): string
    {
        $name = $option->business?->name ?? $option->name;

        return <<<BODY
Hi,

Great news! {$name} has been nominated in our Community's Choice poll: "{$poll->title}"

Voting is open now. Share the poll with your customers to get their support:

{$pollUrl}

The poll closes on {$poll->voting_ends_at?->format('F j, Y')}.

Best,
The Day.News Team
BODY;
    }
}

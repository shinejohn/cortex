import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { BarChart3, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Poll, PollPageProps } from '@/types/poll';
import VotingForm from '@/components/Poll/VotingForm';
import ResultsDisplay from '@/components/Poll/ResultsDisplay';

export default function Show({
    poll: initialPoll,
    hasVoted: initialHasVoted,
    userVotedOptionId: initialVotedOptionId,
    canVote
}: PollPageProps) {
    const [poll, setPoll] = useState<Poll>(initialPoll);
    const [hasVoted, setHasVoted] = useState(initialHasVoted);
    const [userVotedOptionId, setUserVotedOptionId] = useState(initialVotedOptionId);

    const handleVoteSuccess = (updatedPoll: Poll, votedOptionId: string) => {
        setPoll(updatedPoll);
        setHasVoted(true);
        setUserVotedOptionId(votedOptionId);
    };

    return (
        <AppLayout>
            <Head title={poll.title} />

            <div className="max-w-3xl mx-auto py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5 capitalize">
                        <BarChart3 className="h-3.5 w-3.5" />
                        {poll.poll_type?.replace(/_/g, ' ') ?? 'Poll'}
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                        {poll.title}
                    </h1>
                    {poll.description && (
                        <p className="mt-4 text-xl text-muted-foreground max-w-xl mx-auto">
                            {poll.description}
                        </p>
                    )}
                </div>

                {/* Main Content Card */}
                <div className="bg-card rounded-2xl shadow-sm overflow-hidden border-none">
                    <div className="p-6 sm:p-10">
                        {!canVote && !hasVoted ? (
                            <div className="text-center py-10">
                                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-muted mb-4">
                                    <Clock className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <h3 className="font-display text-xl font-bold tracking-tight text-foreground">Voting has ended</h3>
                                <p className="text-muted-foreground mt-2 mb-8">Check below for the final results.</p>
                                <ResultsDisplay poll={poll} />
                            </div>
                        ) : hasVoted ? (
                            <ResultsDisplay
                                poll={poll}
                                userVotedOptionId={userVotedOptionId}
                            />
                        ) : (
                            <VotingForm
                                poll={poll}
                                onVoteSuccess={handleVoteSuccess}
                            />
                        )}
                    </div>
                </div>

                {/* Footer / Meta */}
                <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <p>Poll ID: {poll.slug} -- Voting ends {new Date(poll.voting_ends_at).toLocaleDateString()}</p>
                </div>
            </div>
        </AppLayout>
    );
}

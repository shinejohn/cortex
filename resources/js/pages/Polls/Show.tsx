import { useState } from 'react';
import { Head } from '@inertiajs/react'; // Assuming standard Inertia setup
import AppLayout from '@/layouts/AppLayout'; // Assuming standard Layout
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

            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-4 capitalize">
                        {poll.poll_type.replace(/_/g, ' ')}
                    </span>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        {poll.title}
                    </h1>
                    {poll.description && (
                        <p className="mt-4 text-xl text-gray-500">
                            {poll.description}
                        </p>
                    )}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-6 sm:p-10">
                        {!canVote && !hasVoted ? (
                            <div className="text-center py-10">
                                <h3 className="text-xl font-bold text-gray-900">Voting has ended</h3>
                                <p className="text-gray-500 mt-2">Check below for the final results.</p>
                                <div className="mt-8">
                                    <ResultsDisplay poll={poll} />
                                </div>
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
                <div className="mt-8 text-center text-sm text-gray-400">
                    <p>Poll ID: {poll.slug} • Voting ends {new Date(poll.voting_ends_at).toLocaleDateString()}</p>
                </div>
            </div>
        </AppLayout>
    );
}

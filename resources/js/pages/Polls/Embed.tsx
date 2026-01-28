import { Head } from '@inertiajs/react';
import { Poll } from '@/types/poll';
import VotingForm from '@/components/Poll/VotingForm';
import ResultsDisplay from '@/components/Poll/ResultsDisplay';
import { useState } from 'react';

interface Props {
    poll: Poll;
    directLink: string;
}

export default function Embed({ poll: initialPoll, directLink }: Props) {
    const [poll, setPoll] = useState<Poll>(initialPoll);
    const [hasVoted, setHasVoted] = useState(false);
    const [userVotedOptionId, setUserVotedOptionId] = useState<string | undefined>(undefined);

    const handleVoteSuccess = (updatedPoll: Poll, votedOptionId: string) => {
        setPoll(updatedPoll);
        setHasVoted(true);
        setUserVotedOptionId(votedOptionId);
    };

    return (
        <div className="min-h-screen bg-transparent">
            <Head>
                <title>{poll.title}</title>
                {/* Embed specific styles if needed */}
                <style>{`body { background: transparent; }`}</style>
            </Head>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-bold text-gray-900 truncate pr-4">{poll.title}</h2>
                    <a
                        href={directLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                        Vote on Site →
                    </a>
                </div>

                <div className="p-4">
                    {hasVoted ? (
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
        </div>
    );
}

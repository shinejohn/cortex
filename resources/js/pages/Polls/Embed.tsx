import { Head } from '@inertiajs/react';
import { ExternalLink, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { Poll } from '@/types/poll';
import VotingForm from '@/components/Poll/VotingForm';
import ResultsDisplay from '@/components/Poll/ResultsDisplay';

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

            <div className="bg-card rounded-2xl shadow-sm border-none overflow-hidden">
                <div className="p-4 sm:p-5 bg-muted/30 border-b flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0">
                            <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="font-display text-lg font-bold tracking-tight text-foreground truncate">
                            {poll.title}
                        </h2>
                    </div>
                    <a
                        href={directLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-semibold whitespace-nowrap transition-colors"
                    >
                        Vote on Site
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>

                <div className="p-4 sm:p-6">
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

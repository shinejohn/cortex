import { CheckCircle, BarChart3 } from "lucide-react";
import { Poll } from '@/types/poll';
import OptionCard from './OptionCard';

interface Props {
    poll: Poll;
    userVotedOptionId?: string | null;
}

export default function ResultsDisplay({ poll, userVotedOptionId }: Props) {
    // Sort options by vote count descending
    const sortedOptions = [...poll.options].sort((a, b) => b.vote_count - a.vote_count);
    const totalVotes = poll.total_votes;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center gap-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30 p-4 text-center">
                <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                    Thank you for voting! Here are the current results:
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {sortedOptions.map((option) => (
                    <OptionCard
                        key={option.id}
                        option={option}
                        isSelected={userVotedOptionId === option.id}
                        onSelect={() => { }} // No-op for results view
                        showVoteCounts={true}
                        totalVotes={totalVotes}
                    />
                ))}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Total Votes: <span className="font-semibold text-foreground">{totalVotes.toLocaleString()}</span></span>
            </div>
        </div>
    );
}

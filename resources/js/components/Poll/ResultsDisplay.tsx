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
            <div className="p-4 bg-blue-50 text-blue-900 rounded-lg text-center font-medium border border-blue-100">
                Thank you for voting! Here are the current results:
            </div>

            <div className="grid grid-cols-1 gap-4">
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

            <div className="text-center text-sm text-gray-500 pt-4">
                Total Votes: {totalVotes.toLocaleString()}
            </div>
        </div>
    );
}

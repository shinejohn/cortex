import React, { useState } from 'react';
import axios from 'axios';
import { Poll, PollOption } from '@/types/poll';
import OptionCard from './OptionCard';
import { useFingerprint } from '@/hooks/useFingerprint'; // Assuming this hook exists or we'll create a simple one

interface Props {
    poll: Poll;
    onVoteSuccess: (updatedPoll: Poll, votedOptionId: string) => void;
}

export default function VotingForm({ poll, onVoteSuccess }: Props) {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fingerprint = useFingerprint(); // We might need to implement this simple hook

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOptionId) {
            setError('Please select an option to vote.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post(route('poll.vote', poll.slug), {
                option_id: selectedOptionId,
                fingerprint: fingerprint
            });

            if (response.data.success) {
                onVoteSuccess(response.data.poll, selectedOptionId);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'An error occurred while submitting your vote.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {poll.options.map((option) => (
                    <OptionCard
                        key={option.id}
                        option={option}
                        isSelected={selectedOptionId === option.id}
                        onSelect={() => setSelectedOptionId(option.id)}
                        showVoteCounts={false}
                    />
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!selectedOptionId || isSubmitting}
                className={`
                    w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg
                    transition-all duration-200
                    ${!selectedOptionId || isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
                    }
                `}
            >
                {isSubmitting ? 'Submitting...' : 'Vote Now'}
            </button>
        </form>
    );
}

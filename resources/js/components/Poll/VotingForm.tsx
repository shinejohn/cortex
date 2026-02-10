import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, Vote } from 'lucide-react';
import { Poll, PollOption } from '@/types/poll';
import OptionCard from './OptionCard';
import { useFingerprint } from '@/hooks/useFingerprint';
import { cn } from "@/lib/utils";

interface Props {
    poll: Poll;
    onVoteSuccess: (updatedPoll: Poll, votedOptionId: string) => void;
}

export default function VotingForm({ poll, onVoteSuccess }: Props) {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fingerprint = useFingerprint();

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
            <div className="grid grid-cols-1 gap-3">
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
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30 p-4 text-sm text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!selectedOptionId || isSubmitting}
                className={cn(
                    "w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all duration-200",
                    !selectedOptionId || isSubmitting
                        ? "bg-muted-foreground/30 cursor-not-allowed text-muted-foreground"
                        : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                )}
            >
                {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2">
                        <Vote className="h-5 w-5" />
                        Vote Now
                    </span>
                )}
            </button>
        </form>
    );
}

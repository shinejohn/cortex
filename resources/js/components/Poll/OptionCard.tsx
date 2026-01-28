import { PollOption } from '@/types/poll';

interface Props {
    option: PollOption;
    isSelected: boolean;
    onSelect: () => void;
    showVoteCounts: boolean;
    totalVotes?: number;
}

export default function OptionCard({
    option,
    isSelected,
    onSelect,
    showVoteCounts,
    totalVotes = 0
}: Props) {
    const votePercentage = totalVotes > 0
        ? Math.round((option.vote_count / totalVotes) * 100)
        : 0;

    return (
        <div
            onClick={onSelect}
            className={`
                relative p-4 rounded-lg border-2 cursor-pointer
                transition-all duration-200
                ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${option.is_sponsored ? 'ring-2 ring-yellow-400' : ''}
            `}
        >
            {/* Sponsor Badge */}
            {option.participation_tier === 'premium_sponsor' && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                    ⭐ Sponsor
                </div>
            )}
            {option.participation_tier === 'featured' && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Featured
                </div>
            )}

            <div className="flex items-start gap-4">
                {/* Radio Button */}
                <div className="flex-shrink-0 mt-1">
                    <div className={`
                        w-5 h-5 rounded-full border-2
                        flex items-center justify-center
                        ${isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }
                    `}>
                        {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                    </div>
                </div>

                {/* Option Image */}
                {option.image_url && (
                    <div className="flex-shrink-0">
                        <img
                            src={option.image_url}
                            alt={option.name}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                    </div>
                )}

                {/* Option Content */}
                <div className="flex-grow min-w-0">
                    <h4 className="font-semibold text-gray-900">{option.name}</h4>

                    {option.description && (
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    )}

                    {option.special_offer && (
                        <div className="mt-2 inline-flex items-center text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                            🎁 {option.special_offer}
                        </div>
                    )}

                    {/* Vote Count (if showing results) */}
                    {showVoteCounts && (
                        <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">{option.vote_count} votes</span>
                                <span className="font-semibold">{votePercentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${votePercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* External Link */}
                {option.website_url && (
                    <a
                        href={option.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 text-gray-400 hover:text-blue-500"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
            </div>
        </div>
    );
}

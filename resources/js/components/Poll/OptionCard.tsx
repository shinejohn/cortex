import { ExternalLink, Star, Award } from "lucide-react";
import { PollOption } from '@/types/poll';
import { cn } from "@/lib/utils";

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
            className={cn(
                "relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                isSelected
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md ring-1 ring-indigo-500/20"
                    : "border-border/50 hover:border-indigo-200 hover:bg-muted/30 dark:hover:border-indigo-800/50",
                option.is_sponsored && "ring-2 ring-amber-400/50"
            )}
        >
            {/* Sponsor Badge */}
            {option.participation_tier === 'premium_sponsor' && (
                <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
                    <Star className="h-3 w-3 fill-current" />
                    Sponsor
                </div>
            )}
            {option.participation_tier === 'featured' && (
                <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
                    <Award className="h-3 w-3" />
                    Featured
                </div>
            )}

            <div className="flex items-start gap-4">
                {/* Radio Button */}
                <div className="shrink-0 mt-1">
                    <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected
                            ? "border-indigo-500 bg-indigo-500 shadow-sm"
                            : "border-muted-foreground/30"
                    )}>
                        {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                    </div>
                </div>

                {/* Option Image */}
                {option.image_url && (
                    <div className="shrink-0">
                        <img
                            src={option.image_url}
                            alt={option.name}
                            className="w-16 h-16 rounded-lg object-cover shadow-sm"
                        />
                    </div>
                )}

                {/* Option Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground">{option.name}</h4>

                    {option.description && (
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    )}

                    {option.special_offer && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">
                            🎁 {option.special_offer}
                        </div>
                    )}

                    {/* Vote Count (if showing results) */}
                    {showVoteCounts && (
                        <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-muted-foreground">{option.vote_count} votes</span>
                                <span className="font-semibold text-foreground">{votePercentage}%</span>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-700",
                                        isSelected
                                            ? "bg-gradient-to-r from-indigo-500 to-indigo-600"
                                            : "bg-gradient-to-r from-blue-400 to-indigo-400"
                                    )}
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
                        className="shrink-0 text-muted-foreground hover:text-indigo-500 transition-colors"
                    >
                        <ExternalLink className="w-4.5 h-4.5" />
                    </a>
                )}
            </div>
        </div>
    );
}

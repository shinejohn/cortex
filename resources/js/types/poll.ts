export interface Poll {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    featured_image_url: string | null;
    poll_type: 'weekly_smb_promotional' | 'rapid_issue' | 'reader_requested';
    category: string | null;
    topic: string | null;
    voting_starts_at: string;
    voting_ends_at: string;
    is_active: boolean;
    allow_write_ins: boolean;
    show_results_during_voting: boolean;
    require_login_to_vote: boolean;
    max_votes_per_user: number;
    total_votes: number;
    total_participants: number;
    winner_option_id: string | null;
    results_article_id: string | null;
    options: PollOption[];
}

export interface PollOption {
    id: string;
    poll_id: string;
    business_id: string | null;
    name: string;
    description: string | null;
    image_url: string | null;
    website_url: string | null;
    participation_tier: 'basic' | 'featured' | 'premium_sponsor' | null;
    is_sponsored: boolean;
    special_offer: string | null;
    vote_count: number;
    rank: number | null;
    display_order: number;
}

export interface PollPageProps {
    poll: Poll;
    hasVoted: boolean;
    userVotedOptionId?: string;
    canVote: boolean;
    directLink: string;
    embedCode: string;
}

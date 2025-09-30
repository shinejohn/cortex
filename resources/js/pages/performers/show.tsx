import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { PerformerHero } from '@/components/performers/profile/hero';
import { PerformerQuickStats } from '@/components/performers/profile/quick-stats';
import { PerformerTabs } from '@/components/performers/profile/tabs';
import { PerformerOverview } from '@/components/performers/profile/overview';
import { PerformerUpcomingShows } from '@/components/performers/profile/upcoming-shows';
import { PerformerReviews } from '@/components/performers/profile/reviews';
import { PerformerAbout } from '@/components/performers/profile/about';
import type { PerformerShowPageProps, ProfileTab } from '@/types/performer-profile';

export default function PerformerShow() {
    const { performer, ratingStats, reviews, auth, isFollowing } = usePage<PerformerShowPageProps>().props;
    const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

    const handleTabChange = (tab: ProfileTab) => {
        setActiveTab(tab);
    };

    return (
        <>
            <Head title={`${performer.name} - Performer Profile`} />
            <Header auth={auth} />

            <div className="min-h-screen bg-gray-50">
                <PerformerHero performer={performer} isFollowing={isFollowing} />

                <PerformerQuickStats performer={performer} />

                <PerformerTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    upcomingShowsCount={performer.upcomingShows.length}
                    reviewsCount={performer.reviewCount}
                    averageRating={performer.rating}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {activeTab === 'overview' && (
                        <PerformerOverview
                            performer={performer}
                            ratingStats={ratingStats}
                            recentReviews={reviews.slice(0, 3)}
                        />
                    )}

                    {activeTab === 'upcoming-shows' && (
                        <PerformerUpcomingShows shows={performer.upcomingShows} />
                    )}

                    {activeTab === 'reviews' && (
                        <PerformerReviews
                            reviews={reviews}
                            ratingStats={ratingStats}
                            performerId={performer.id}
                        />
                    )}

                    {activeTab === 'about' && (
                        <PerformerAbout performer={performer} />
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
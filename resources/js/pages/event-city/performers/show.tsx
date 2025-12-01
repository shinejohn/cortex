import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { PerformerAbout } from "@/components/performers/profile/about";
import { PerformerHero } from "@/components/performers/profile/hero";
import { PerformerOverview } from "@/components/performers/profile/overview";
import { PerformerQuickStats } from "@/components/performers/profile/quick-stats";
import { PerformerReviews } from "@/components/performers/profile/reviews";
import { PerformerTabs } from "@/components/performers/profile/tabs";
import { PerformerUpcomingShows } from "@/components/performers/profile/upcoming-shows";
import type { PerformerShowPageProps, ProfileTab } from "@/types/performer-profile";
import { usePage } from "@inertiajs/react";
import { useState } from "react";

export default function PerformerShow() {
    const { performer, ratingStats, reviews, auth, isFollowing } = usePage<PerformerShowPageProps>().props;
    const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

    const handleTabChange = (tab: ProfileTab) => {
        setActiveTab(tab);
    };

    return (
        <>
            <SEO
                type="performer"
                site="event-city"
                data={{
                    title: `${performer.name} - Performer Profile`,
                    name: performer.name,
                    description: performer.bio,
                    image: performer.profileImage,
                    url: `/performers/${performer.id}`,
                    genres: performer.genres,
                    homeCity: performer.homeCity,
                    isVerified: performer.isVerified,
                }}
            />
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
                    {activeTab === "overview" && (
                        <PerformerOverview performer={performer} ratingStats={ratingStats} recentReviews={reviews.slice(0, 3)} />
                    )}

                    {activeTab === "upcoming-shows" && <PerformerUpcomingShows shows={performer.upcomingShows} />}

                    {activeTab === "reviews" && <PerformerReviews reviews={reviews} ratingStats={ratingStats} performerId={performer.id} />}

                    {activeTab === "about" && <PerformerAbout performer={performer} />}
                </div>
            </div>

            <Footer />
        </>
    );
}

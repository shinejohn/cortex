import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowRightIcon, MessageCircleIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { Footer } from "@/components/common/footer";
import { GridCard } from "@/components/common/grid-card";
import Header from "@/components/common/header";
import { CommunityShowcase } from "@/components/community/community-showcase";
import { Button } from "@/components/ui/button";
import type { Community, CommunityIndexPageProps } from "@/types/community";

export default function CommunityIndex() {
    const { auth, communities = [], showcaseData = [] } = usePage<CommunityIndexPageProps>().props;

    const renderCommunityContent = (community: Community) => (
        <>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
                <UsersIcon className="h-4 w-4 mr-1" />
                {community.memberCount.toLocaleString()} members
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                    <MessageCircleIcon className="h-4 w-4 mr-1" />
                    {community.threadCount} threads
                </div>
                <div className="flex flex-wrap gap-1">
                    {community.categories.slice(0, 2).map((category, index) => (
                        <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                            {category}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );

    return (
        <>
            <Head title="Communities" />
            <Header auth={auth} />

            {/* Community Showcase */}
            <CommunityShowcase showcaseData={showcaseData} />

            {/* Page Title */}
            <div className="py-8 bg-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Communities</h1>
                            <p className="mt-2 text-muted-foreground">
                                Join conversations and connect with like-minded people in our community discussions.
                            </p>
                        </div>
                        <Link href="/community/impact">
                            <Button variant="outline" className="flex items-center gap-2">
                                <TrendingUpIcon className="h-4 w-4" />
                                Community Impact
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Communities Grid */}
            <div className="py-4">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    {communities.length === 0 ? (
                        <div className="bg-card rounded-lg p-8 text-center border border-border">
                            <MessageCircleIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-lg font-medium text-card-foreground">No communities found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Communities will appear here once they are created.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {communities.map((community) => (
                                <GridCard
                                    key={community.id}
                                    id={community.id}
                                    href={`/community/${community.id}`}
                                    image={community.image}
                                    imageAlt={community.name}
                                    title={community.name}
                                    onClick={() => handleCommunityClick(community)}
                                >
                                    <div className="mb-3">
                                        <p className="text-sm text-muted-foreground line-clamp-3">{community.description}</p>
                                    </div>
                                    {renderCommunityContent(community)}
                                </GridCard>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}

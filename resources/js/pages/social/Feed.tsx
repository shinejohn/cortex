import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { AlgorithmicFeed } from "@/components/social/algorithmic-feed";
import { SocialSidebar } from "@/components/social/social-sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User, SocialUserProfile } from "@/types/social";
import { Head, usePage } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

interface SocialFeedPageProps {
    auth: {
        user: User;
    };
    user_profile?: SocialUserProfile;
    suggested_friends?: User[];
    currentFeed?: 'for-you' | 'followed';
}

export default function Feed() {
    const { auth, user_profile, suggested_friends, currentFeed = 'for-you' } = usePage<SocialFeedPageProps>().props;
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [activeTab, setActiveTab] = useState(currentFeed);

    return (
        <>
            <Head title="Social Feed" />
            <Header auth={auth} />

            <div className="min-h-screen bg-muted/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Main feed */}
                        <div className="lg:col-span-8">
                            {/* Create post section */}
                            <div className="bg-card rounded-xl border shadow-sm p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                        className="w-10 h-10 rounded-full ring-2 ring-background"
                                    />
                                    <button
                                        onClick={() => setShowCreatePost(true)}
                                        className="flex-1 bg-muted/50 hover:bg-muted/70 text-muted-foreground text-left px-4 py-3 rounded-full transition-all duration-200 hover:shadow-sm border border-border/50"
                                    >
                                        What's on your mind, {auth.user.name.split(' ')[0]}?
                                    </button>
                                    <Button
                                        onClick={() => setShowCreatePost(true)}
                                        size="sm"
                                        className="shrink-0 rounded-full px-6"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Post
                                    </Button>
                                </div>
                            </div>

                            {/* Feed Tabs */}
                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'for-you' | 'followed')} className="w-full">
                                <div className="bg-card rounded-xl border shadow-sm mb-4">
                                    <TabsList className="grid w-full grid-cols-2 bg-transparent h-12 p-1 rounded-xl">
                                        <TabsTrigger
                                            value="for-you"
                                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            <span className="text-lg">✨</span>
                                            For You
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="followed"
                                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            <span className="text-lg">👥</span>
                                            Following
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="for-you" className="mt-0">
                                    <AlgorithmicFeed
                                        feedType="for-you"
                                        currentUser={auth.user}
                                        showCreatePost={showCreatePost}
                                        onCloseCreatePost={() => setShowCreatePost(false)}
                                    />
                                </TabsContent>

                                <TabsContent value="followed" className="mt-0">
                                    <AlgorithmicFeed
                                        feedType="followed"
                                        currentUser={auth.user}
                                        showCreatePost={showCreatePost}
                                        onCloseCreatePost={() => setShowCreatePost(false)}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-6">
                                <SocialSidebar
                                    currentUser={auth.user}
                                    userProfile={user_profile}
                                    suggestedFriends={suggested_friends}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { AlgorithmicFeed } from "@/components/social/algorithmic-feed";
import { InlinePostCreator } from "@/components/social/inline-post-creator";
import { SocialSidebar } from "@/components/social/social-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User, SocialUserProfile, SocialPost } from "@/types/social";
import { Head, usePage } from "@inertiajs/react";
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
    const [newPosts, setNewPosts] = useState<SocialPost[]>([]);
    const [activeTab, setActiveTab] = useState(currentFeed);

    const handleNewPost = (post: SocialPost) => {
        setNewPosts(prev => [post, ...prev]);
    };

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
                            <InlinePostCreator
                                currentUser={auth.user}
                                onPost={handleNewPost}
                                className="mb-6"
                            />

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
                                        newPosts={newPosts}
                                    />
                                </TabsContent>

                                <TabsContent value="followed" className="mt-0">
                                    <AlgorithmicFeed
                                        feedType="followed"
                                        currentUser={auth.user}
                                        newPosts={newPosts}
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
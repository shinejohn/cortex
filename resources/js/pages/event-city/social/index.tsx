import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { AlgorithmicFeed } from "@/components/social/algorithmic-feed";
import { InlinePostCreator } from "@/components/social/inline-post-creator";
import { SocialFeed } from "@/components/social/social-feed";
import { SocialSidebar } from "@/components/social/social-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SocialFeedPageProps, SocialPost } from "@/types/social";
import { Head, usePage } from "@inertiajs/react";
import { Sparkles, Users } from "lucide-react";
import { useState } from "react";

export default function SocialIndex() {
    const { auth, posts, user_profile, suggested_friends } = usePage<SocialFeedPageProps>().props;
    const [newPosts, setNewPosts] = useState<SocialPost[]>([]);

    const handleNewPost = (post: SocialPost) => {
        setNewPosts((prev) => [post, ...prev]);
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
                            <InlinePostCreator currentUser={auth.user} onPost={handleNewPost} className="mb-4" />

                            {/* Feed Tabs */}
                            <Tabs defaultValue="for-you" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="for-you" className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        For You
                                    </TabsTrigger>
                                    <TabsTrigger value="friends" className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Friends
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="for-you" className="mt-0">
                                    <AlgorithmicFeed feedType="for-you" currentUser={auth.user} newPosts={newPosts} />
                                </TabsContent>

                                <TabsContent value="friends" className="mt-0">
                                    <AlgorithmicFeed feedType="followed" currentUser={auth.user} newPosts={newPosts} />
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-6">
                                <SocialSidebar currentUser={auth.user} userProfile={user_profile} suggestedFriends={suggested_friends} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

import { SocialPostCard } from "@/components/social/social-post-card";
import type { SocialPost, User } from "@/types/social";
import { useEffect, useState } from "react";

interface SocialFeedProps {
    posts: SocialPost[];
    currentUser: User;
    newPosts?: SocialPost[];
}

export function SocialFeed({ posts, currentUser, newPosts = [] }: SocialFeedProps) {
    const [feedPosts, setFeedPosts] = useState(posts);

    // Add new posts to the top of the feed when they're created
    useEffect(() => {
        if (newPosts.length > 0) {
            setFeedPosts((prev) => [...newPosts, ...prev]);
        }
    }, [newPosts]);

    const handlePostUpdate = (updatedPost: SocialPost) => {
        setFeedPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
    };

    const handlePostDelete = (postId: string) => {
        setFeedPosts((prev) => prev.filter((post) => post.id !== postId));
    };

    return (
        <div className="space-y-4">
            {feedPosts.length === 0 ? (
                <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">No posts yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        Be the first to share something with your community! Your posts will appear here.
                    </p>
                </div>
            ) : (
                feedPosts.map((post) => (
                    <SocialPostCard key={post.id} post={post} currentUser={currentUser} onUpdate={handlePostUpdate} onDelete={handlePostDelete} />
                ))
            )}
        </div>
    );
}

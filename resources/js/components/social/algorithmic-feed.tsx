import { SocialPostCard } from "@/components/social/social-post-card";
import { CreatePostModal } from "@/components/social/create-post-modal";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import type { SocialPost, User } from "@/types/social";
import { useEffect, useState, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";
import { useEngagementTracking } from "@/hooks/use-engagement-tracking";

interface AlgorithmicFeedProps {
    feedType: 'for-you' | 'followed';
    currentUser: User;
    showCreatePost: boolean;
    onCloseCreatePost: () => void;
}

interface FeedData {
    data: SocialPost[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        has_more: boolean;
    };
}

export function AlgorithmicFeed({
    feedType,
    currentUser,
    showCreatePost,
    onCloseCreatePost
}: AlgorithmicFeedProps) {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const { trackPostView, trackScrollDepth } = useEngagementTracking(currentUser);
    const observer = useRef<IntersectionObserver>();
    const viewedPosts = useRef(new Set<string>());

    // Ref for the last post element to trigger infinite scroll
    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, loading]);

    // Load initial feed
    const loadFeed = useCallback(async (page = 1, refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            setError(null);

            const endpoint = feedType === 'for-you' ? '/social/feed/for-you' : '/social/feed/followed';
            const response = await fetch(`${endpoint}?page=${page}&per_page=20`);

            if (!response.ok) {
                throw new Error(`Failed to load feed: ${response.statusText}`);
            }

            const data: FeedData = await response.json();

            // Process response
            if (page === 1 || refresh) {
                setPosts(data.data || []);
                setCurrentPage(1);
            } else {
                setPosts(prev => [...prev, ...(data.data || [])]);
            }

            setCurrentPage(data.pagination?.current_page || page);
            setHasMore(data.pagination?.has_more || false);

            return data;

        } catch (err) {
            console.error('Error loading feed:', err);
            setError(err instanceof Error ? err.message : 'Failed to load feed');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [feedType]);

    // Load more posts for infinite scroll
    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore || loading) return;
        loadFeed(currentPage + 1);
    }, [hasMore, loadingMore, loading, currentPage, loadFeed]);

    // Refresh feed
    const handleRefresh = useCallback(() => {
        viewedPosts.current.clear();
        loadFeed(1, true);
    }, [loadFeed]);

    // Track post views using intersection observer
    const trackPostInView = useCallback((postId: string, post: SocialPost) => {
        if (!viewedPosts.current.has(postId)) {
            viewedPosts.current.add(postId);
            trackPostView(post);
        }
    }, [trackPostView]);

    // Initialize feed
    useEffect(() => {
        loadFeed(1);
    }, [feedType]);

    // Track scroll depth for engagement
    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPercentage = Math.round(
                    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                );

                if (scrollPercentage > 0 && scrollPercentage % 25 === 0) {
                    trackScrollDepth(scrollPercentage, Array.from(viewedPosts.current));
                }
            }, 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [trackScrollDepth]);

    const handleNewPost = (newPost: SocialPost) => {
        setPosts(prev => [newPost, ...prev]);
        onCloseCreatePost();
    };

    const handlePostUpdate = (updatedPost: SocialPost) => {
        setPosts(prev => prev.map(post =>
            post.id === updatedPost.id ? updatedPost : post
        ));
    };

    const handlePostDelete = (postId: string) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
        viewedPosts.current.delete(postId);
    };

    if (error && posts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                    {error}
                </p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
            </div>
        );
    }

    if (loading && posts.length === 0) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border shadow-sm p-6 animate-pulse">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-muted rounded-full shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-muted rounded w-1/4" />
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted rounded w-full" />
                                    <div className="h-4 bg-muted rounded w-3/4" />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <div className="h-8 bg-muted rounded w-16" />
                                    <div className="h-8 bg-muted rounded w-20" />
                                    <div className="h-8 bg-muted rounded w-16" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        const emptyMessage = feedType === 'for-you'
            ? {
                icon: "✨",
                title: "Your personalized feed is empty",
                description: "Start following people and engaging with posts to see personalized recommendations here."
            }
            : {
                icon: "👥",
                title: "No posts from people you follow",
                description: "Follow some friends or join groups to see their posts in your Following feed."
            };

        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{emptyMessage.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{emptyMessage.title}</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                    {emptyMessage.description}
                </p>
                <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
                    {refreshing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Refresh button */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {posts.length} posts • {feedType === 'for-you' ? 'Personalized for you' : 'From people you follow'}
                </p>
                <Button
                    onClick={handleRefresh}
                    variant="ghost"
                    size="sm"
                    disabled={refreshing}
                    className="h-8 px-3"
                >
                    {refreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Posts */}
            <div className="space-y-4">
                {posts.map((post, index) => (
                    <div
                        key={post.id}
                        ref={index === posts.length - 1 ? lastPostElementRef : null}
                    >
                        <PostWithTracking
                            post={post}
                            currentUser={currentUser}
                            onUpdate={handlePostUpdate}
                            onDelete={handlePostDelete}
                            onView={trackPostInView}
                        />
                    </div>
                ))}
            </div>

            {/* Loading more indicator */}
            {loadingMore && (
                <div className="flex justify-center py-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading more posts...</span>
                    </div>
                </div>
            )}

            {/* End of feed message */}
            {!hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">You've reached the end of your {feedType === 'for-you' ? 'personalized' : 'following'} feed</p>
                </div>
            )}

            <CreatePostModal
                isOpen={showCreatePost}
                onClose={onCloseCreatePost}
                onPost={handleNewPost}
                currentUser={currentUser}
            />
        </div>
    );
}

// Component to track when posts come into view
interface PostWithTrackingProps {
    post: SocialPost;
    currentUser: User;
    onUpdate: (post: SocialPost) => void;
    onDelete: (postId: string) => void;
    onView: (postId: string, post: SocialPost) => void;
}

function PostWithTracking({ post, currentUser, onUpdate, onDelete, onView }: PostWithTrackingProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Post is in view for at least 50% and 1 second
                    const timer = setTimeout(() => {
                        if (entry.isIntersecting) {
                            onView(post.id, post);
                        }
                    }, 1000);

                    return () => clearTimeout(timer);
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [post.id, post, onView]);

    return (
        <div ref={elementRef}>
            <SocialPostCard
                post={post}
                currentUser={currentUser}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />
        </div>
    );
}
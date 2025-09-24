import { useCallback, useEffect, useRef } from 'react';
import type { SocialPost, User } from '@/types/social';
import { router } from '@inertiajs/react';

interface EngagementData {
    user_id: string;
    type: string;
    data: any;
}

export function useEngagementTracking(currentUser: User) {
    const sessionStartTime = useRef<Date>(new Date());
    const engagementQueue = useRef<EngagementData[]>([]);
    const flushTimeout = useRef<NodeJS.Timeout>();

    // Queue engagement data for batch sending
    const queueEngagement = useCallback((type: string, data: any = {}) => {
        const engagement: EngagementData = {
            user_id: currentUser.id,
            type,
            data: {
                ...data,
                timestamp: new Date().toISOString(),
                session_id: sessionStartTime.current.getTime().toString(),
            },
        };

        engagementQueue.current.push(engagement);

        // Debounce the flush to avoid too many requests
        if (flushTimeout.current) {
            clearTimeout(flushTimeout.current);
        }

        flushTimeout.current = setTimeout(() => {
            flushEngagements();
        }, 2000); // Flush every 2 seconds
    }, [currentUser.id]);

    // Send queued engagement data to server
    const flushEngagements = useCallback(async () => {
        if (engagementQueue.current.length === 0) return;

        const engagements = [...engagementQueue.current];
        engagementQueue.current = [];

        try {
            await fetch('/api/engagement/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ engagements }),
            });
        } catch (error) {
            console.error('Failed to track engagement:', error);
            // Re-queue failed engagements
            engagementQueue.current.unshift(...engagements);
        }
    }, []);

    // Track post view
    const trackPostView = useCallback((post: SocialPost) => {
        queueEngagement('post_view', {
            post_id: post.id,
            post_author_id: post.user_id,
            content_type: determineContentType(post),
        });
    }, [queueEngagement]);

    // Track post interaction (like, comment, share)
    const trackPostInteraction = useCallback((post: SocialPost, interactionType: 'post_like' | 'post_comment' | 'post_share') => {
        queueEngagement(interactionType, {
            post_id: post.id,
            post_author_id: post.user_id,
            content_type: determineContentType(post),
        });
    }, [queueEngagement]);

    // Track scroll depth
    const trackScrollDepth = useCallback((depth: number, viewedPosts: string[] = []) => {
        queueEngagement('scroll_depth', {
            depth,
            viewed_posts: viewedPosts,
        });
    }, [queueEngagement]);

    // Track time spent on post
    const trackTimeSpent = useCallback((post: SocialPost, seconds: number) => {
        queueEngagement('time_spent', {
            post_id: post.id,
            post_author_id: post.user_id,
            duration: seconds,
        });
    }, [queueEngagement]);

    // Track profile view
    const trackProfileView = useCallback((userId: string) => {
        queueEngagement('profile_view', {
            viewed_user_id: userId,
        });
    }, [queueEngagement]);

    // Track session start
    const trackSessionStart = useCallback(() => {
        fetch('/api/engagement/session/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        }).catch(error => {
            console.error('Failed to track session start:', error);
        });
    }, []);

    // Track session end
    const trackSessionEnd = useCallback(() => {
        const sessionDuration = Math.floor((new Date().getTime() - sessionStartTime.current.getTime()) / 1000);

        // Send immediately, don't queue
        fetch('/api/engagement/session/end', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({
                session_duration: sessionDuration,
            }),
        }).catch(error => {
            console.error('Failed to track session end:', error);
        });

        // Flush any remaining engagements
        flushEngagements();
    }, [flushEngagements]);

    // Initialize session tracking
    useEffect(() => {
        trackSessionStart();

        // Track session end on page unload
        const handleUnload = () => {
            trackSessionEnd();
        };

        // Track session end on visibility change (mobile/tab switching)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                trackSessionEnd();
            } else {
                trackSessionStart();
                sessionStartTime.current = new Date();
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (flushTimeout.current) {
                clearTimeout(flushTimeout.current);
            }
            flushEngagements();
        };
    }, [trackSessionStart, trackSessionEnd, flushEngagements]);

    // Periodic flush of engagement queue
    useEffect(() => {
        const interval = setInterval(() => {
            if (engagementQueue.current.length > 0) {
                flushEngagements();
            }
        }, 10000); // Flush every 10 seconds if there's data

        return () => clearInterval(interval);
    }, [flushEngagements]);

    return {
        trackPostView,
        trackPostInteraction,
        trackScrollDepth,
        trackTimeSpent,
        trackProfileView,
        trackSessionStart,
        trackSessionEnd,
    };
}

// Helper function to determine content type
function determineContentType(post: SocialPost): string {
    if (post.media && post.media.length > 0) {
        return 'media';
    }

    if (post.location) {
        return 'location';
    }

    if (post.content && post.content.length > 200) {
        return 'long_text';
    }

    return 'short_text';
}
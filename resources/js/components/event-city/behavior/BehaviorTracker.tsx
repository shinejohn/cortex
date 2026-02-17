import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

interface BehaviorTrackerProps {
    contentType?: string;
    contentId?: string;
    category?: string;
}

/**
 * Invisible component that tracks page views via useEffect.
 * Mount this on any page that should be tracked.
 */
export function BehaviorTracker({ contentType, contentId, category }: BehaviorTrackerProps) {
    const { url } = usePage();
    const trackedRef = useRef<string | null>(null);

    useEffect(() => {
        const trackingKey = `${url}:${contentType}:${contentId}`;

        if (trackedRef.current === trackingKey) {
            return;
        }

        trackedRef.current = trackingKey;

        const controller = new AbortController();

        axios
            .post(
                '/api/behavior/track',
                {
                    event_type: 'page_view',
                    content_type: contentType ?? null,
                    content_id: contentId ?? null,
                    category: category ?? null,
                    context: {
                        url,
                        referrer: document.referrer || null,
                        timestamp: new Date().toISOString(),
                    },
                },
                { signal: controller.signal },
            )
            .catch(() => {
                // Silently fail - tracking should not impact user experience
            });

        return () => {
            controller.abort();
        };
    }, [url, contentType, contentId, category]);

    return null;
}

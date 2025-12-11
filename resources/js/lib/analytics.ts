import ReactGA from "react-ga4";

let initialized = false;

/**
 * Initialize Google Analytics 4 with the provided measurement ID.
 * Safe to call multiple times - will only initialize once.
 */
export function initializeAnalytics(measurementId: string | null): void {
    if (initialized || !measurementId || typeof window === "undefined") {
        return;
    }

    ReactGA.initialize(measurementId);
    initialized = true;
}

/**
 * Track a page view. Call this on route changes.
 */
export function trackPageView(path: string, title?: string): void {
    if (!initialized) {
        return;
    }

    ReactGA.send({
        hitType: "pageview",
        page: path,
        title: title,
    });
}

/**
 * Track a custom event.
 */
export function trackEvent(category: string, action: string, label?: string, value?: number): void {
    if (!initialized) {
        return;
    }

    ReactGA.event({
        category,
        action,
        label,
        value,
    });
}

/**
 * Check if analytics has been initialized.
 */
export function isAnalyticsInitialized(): boolean {
    return initialized;
}

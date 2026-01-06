import "../css/app.css";

import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot, hydrateRoot } from "react-dom/client";
import CrossDomainAuthSync from "./components/common/cross-domain-auth-sync";
import { initializeTheme } from "./hooks/use-appearance";
import { initializeAnalytics, trackPageView } from "./lib/analytics";

createInertiaApp({
    title: (title) => `${title}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob("./pages/**/*.tsx")),
    setup({ el, App, props }) {
        // Initialize Google Analytics with the measurement ID from shared props
        const pageProps = props.initialPage.props;
        const ga4Id = "analytics" in pageProps && pageProps.analytics && typeof pageProps.analytics === "object" && "ga4Id" in pageProps.analytics
            ? (pageProps.analytics.ga4Id as string | null)
            : null;
        initializeAnalytics(ga4Id);

        // Track page views on navigation
        router.on("navigate", (event) => {
            trackPageView(event.detail.page.url);
        });

        // Error handling for React rendering errors
        const handleError = (error: Error, errorInfo: any) => {
            console.error("React rendering error:", error, errorInfo);
            // Log to error tracking service if available
            if (typeof window !== "undefined" && (window as any).Sentry) {
                (window as any).Sentry.captureException(error);
            }
        };

        // Check if SSR rendered content exists - if so, hydrate, otherwise create fresh
        const rootElement = (
            <>
                <App {...props} />
                <CrossDomainAuthSync />
            </>
        );

        try {
            if (el.hasChildNodes()) {
                hydrateRoot(el, rootElement);
            } else {
                createRoot(el).render(rootElement);
            }
        } catch (error) {
            handleError(error as Error, { component: props.initialPage.component });
            // Re-throw to let Inertia handle it
            throw error;
        }
    },
    progress: {
        color: "#4B5563",
    },
});

// This will set light / dark mode on load...
initializeTheme();

import "../css/app.css";

import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot, hydrateRoot } from "react-dom/client";
import CrossDomainAuthSync from "./components/common/cross-domain-auth-sync";
import { initializeTheme } from "./hooks/use-appearance";
import { initializeAnalytics, trackPageView } from "./lib/analytics";

createInertiaApp({
    title: (title) => `${title}`,
 resolve: (name) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/8cceea84-1baa-4754-b662-98d7ceb2bd0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources/js/app.tsx:12',message:'Resolving Inertia page',data:{pageName:name,pattern:`./pages/${name}.tsx`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        try {
            const component = resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob("./pages/**/*.tsx"));
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/8cceea84-1baa-4754-b662-98d7ceb2bd0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources/js/app.tsx:17',message:'Page resolved successfully',data:{pageName:name,componentFound:!!component},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return component;
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/8cceea84-1baa-4754-b662-98d7ceb2bd0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources/js/app.tsx:22',message:'Page resolution failed',data:{pageName:name,error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            throw error;
        }
    },


    setup({ el, App, props }) {
        // Initialize Google Analytics with the measurement ID from shared props
        const pageProps = props.initialPage.props;
        const ga4Id =
            "analytics" in pageProps && pageProps.analytics && typeof pageProps.analytics === "object" && "ga4Id" in pageProps.analytics
                ? (pageProps.analytics.ga4Id as string | null)
                : null;
        initializeAnalytics(ga4Id);

        // Track page views on navigation
        router.on("navigate", (event) => {
            trackPageView(event.detail.page.url);
        });
        // Error handling for React rendering errors
        const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
            console.error("React rendering error:", error, errorInfo);
            // Log to error tracking service if available
            if (typeof window !== "undefined" && (window as { Sentry?: { captureException: (error: Error) => void } }).Sentry) {
                (window as { Sentry: { captureException: (error: Error) => void } }).Sentry.captureException(error);
            }
        };

        // Check if SSR rendered content exists - if so, hydrate, otherwise create fresh
        const rootElement = (
            <>
                <App {...props} />
                <CrossDomainAuthSync crossDomainAuth={pageProps.crossDomainAuth as { urls?: string[]; logoutUrls?: string[] } | undefined} />
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

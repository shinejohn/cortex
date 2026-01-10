import { usePage } from "@inertiajs/react";
import { useEffect } from "react";

interface CrossDomainAuthProps {
    urls?: string[];
    logoutUrls?: string[];
}

/**
 * Component to handle cross-domain authentication sync
 * Automatically redirects to other domains after login/logout
 */
export default function CrossDomainAuthSync() {
    const { crossDomainAuth } = usePage<{ crossDomainAuth: CrossDomainAuthProps }>().props;
    const { urls = [], logoutUrls = [] } = crossDomainAuth || {};

    useEffect(() => {
        // Handle login sync
        if (urls.length > 0) {
            // Use hidden iframes to sync auth across domains
            // This is more seamless than redirects
            urls.forEach((url) => {
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = url;
                document.body.appendChild(iframe);

                // Remove iframe after a delay
                setTimeout(() => {
                    iframe.remove();
                }, 2000);
            });

            // Clear URLs from session after processing
            // This is handled server-side when the sync endpoint is hit
        }

        // Handle logout sync
        if (logoutUrls.length > 0) {
            logoutUrls.forEach((url) => {
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = url;
                document.body.appendChild(iframe);

                setTimeout(() => {
                    iframe.remove();
                }, 2000);
            });
        }
    }, [urls, logoutUrls]);

    // This component doesn't render anything
    return null;
}

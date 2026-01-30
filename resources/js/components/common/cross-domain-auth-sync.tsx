import { useEffect } from "react";

interface CrossDomainAuthProps {
    urls?: string[];
    logoutUrls?: string[];
}

interface Props {
    crossDomainAuth?: CrossDomainAuthProps;
}

/**
* Component to handle cross-domain authentication sync
* Automatically redirects to other domains after login/logout
*/
export default function CrossDomainAuthSync({ crossDomainAuth }: Props) {
    const { urls = [], logoutUrls = [] } = crossDomainAuth || {};

    useEffect(() => {
        if (urls.length > 0) {
            urls.forEach((url) => {
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = url;
                document.body.appendChild(iframe);
                setTimeout(() => {
                    iframe.remove();
                }, 2000);
            });
        }

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

    return null;
}

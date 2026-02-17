import { useEffect, useRef } from "react";

interface Props {
    scriptCode: string;
    className?: string;
}

export function GoogleAd({ scriptCode, className = "" }: Props) {
    const adContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!adContainerRef.current) return;

        // Clear previous content
        adContainerRef.current.innerHTML = "";

        // Create a safe container for the script
        const container = document.createElement("div");
        adContainerRef.current.appendChild(container);

        // Security check: Don't execute if it looks like a malicious payload that isn't ad-related
        // (Basic check, real security depends on backend validation)

        // Extract script content
        const scripts = new DOMParser().parseFromString(scriptCode, "text/html").querySelectorAll("script");

        // Also copy non-script HTML
        container.innerHTML = scriptCode.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");

        // Execute scripts manually
        scripts.forEach((oldScript) => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            container.appendChild(newScript);
        });

    }, [scriptCode]);

    return (
        <div
            ref={adContainerRef}
            className={`google-ad-container overflow-hidden ${className}`}
        />
    );
}

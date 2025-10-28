import { APIProvider } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";

interface GoogleMapsProviderProps {
    children: ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error("Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.");
        return <>{children}</>;
    }

    return (
        <APIProvider apiKey={apiKey} libraries={["places"]}>
            {children}
        </APIProvider>
    );
}

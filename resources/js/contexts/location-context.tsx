import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import React, { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

// Location API endpoints - using relative URLs to work across all domains
const LOCATION_API = {
    search: "/api/location/search",
    setRegion: "/api/location/set-region",
    detectBrowser: "/api/location/detect-browser",
    clear: "/api/location/clear",
} as const;

interface Region {
    id: string;
    name: string;
    slug: string;
    type: string;
    full_name: string;
    latitude?: string;
    longitude?: string;
}

interface LocationContextType {
    currentRegion: Region | null;
    confirmed: boolean;
    setRegion: (regionId: string) => Promise<void>;
    detectFromBrowser: () => Promise<void>;
    searchRegions: (query: string) => Promise<Region[]>;
    clearLocation: () => Promise<void>;
    isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
    children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
    const { location } = usePage<{
        location: { current_region: Region | null; confirmed: boolean };
    }>().props;

    const [currentRegion, setCurrentRegion] = useState<Region | null>(location.current_region);
    const [confirmed, setConfirmed] = useState(location.confirmed);
    const [isLoading, setIsLoading] = useState(false);

    const setRegion = useCallback(async (regionId: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(LOCATION_API.setRegion, {
                region_id: regionId,
            });

            if (response.data.success) {
                setCurrentRegion(response.data.region);
                setConfirmed(true);

                // Navigate to region-specific URL for permalink
                const regionSlug = response.data.region.slug;
                router.visit(`/${regionSlug}`, {
                    preserveState: false,
                    preserveScroll: false,
                });
            }
        } catch (error) {
            console.error("Failed to set region:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const detectFromBrowser = useCallback(async () => {
        if (!navigator.geolocation) {
            throw new Error("Geolocation is not supported by your browser");
        }

        setIsLoading(true);

        return new Promise<void>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const response = await axios.post(LOCATION_API.detectBrowser, {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });

                        if (response.data.success) {
                            setCurrentRegion(response.data.region);
                            setConfirmed(false);

                            // Navigate to detected region's URL
                            const regionSlug = response.data.region.slug;
                            router.visit(`/${regionSlug}`, {
                                preserveState: false,
                                preserveScroll: false,
                            });
                            resolve();
                        } else {
                            reject(new Error("Failed to detect region from coordinates"));
                        }
                    } catch (error) {
                        console.error("Failed to detect location from browser:", error);
                        reject(error);
                    } finally {
                        setIsLoading(false);
                    }
                },
                (error) => {
                    setIsLoading(false);
                    console.error("Geolocation error:", error);
                    reject(error);
                },
            );
        });
    }, []);

    const searchRegions = useCallback(async (query: string): Promise<Region[]> => {
        try {
            const response = await axios.get(LOCATION_API.search, {
                params: { query, limit: 10 },
            });

            if (response.data.success) {
                return response.data.regions;
            }

            return [];
        } catch (error) {
            console.error("Failed to search regions:", error);
            return [];
        }
    }, []);

    const clearLocation = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(LOCATION_API.clear);

            if (response.data.success) {
                setCurrentRegion(null);
                setConfirmed(false);
                router.reload();
            }
        } catch (error) {
            console.error("Failed to clear location:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value = useMemo(
        () => ({
            currentRegion,
            confirmed,
            setRegion,
            detectFromBrowser,
            searchRegions,
            clearLocation,
            isLoading,
        }),
        [currentRegion, confirmed, setRegion, detectFromBrowser, searchRegions, clearLocation, isLoading],
    );

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
}

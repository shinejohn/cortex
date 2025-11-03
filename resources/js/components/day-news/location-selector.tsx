import { useLocation } from "@/contexts/location-context";
import { MapPin, Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

interface Region {
    id: string;
    name: string;
    slug: string;
    type: string;
    full_name: string;
}

interface LocationSelectorProps {
    onSelect?: (region: Region) => void;
    className?: string;
}

export default function LocationSelector({ onSelect, className = "" }: LocationSelectorProps) {
    const { searchRegions, setRegion, detectFromBrowser, isLoading } = useLocation();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Region[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            const regions = await searchRegions(query);
            setResults(regions);
            setIsOpen(true);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, searchRegions]);

    const handleSelect = async (region: Region) => {
        await setRegion(region.id);
        setQuery("");
        setResults([]);
        setIsOpen(false);
        onSelect?.(region);
    };

    const handleUseMyLocation = async () => {
        setIsDetecting(true);
        try {
            await detectFromBrowser();
            setQuery("");
            setResults([]);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to detect location:", error);
            alert("Unable to detect your location. Please try manually searching.");
        } finally {
            setIsDetecting(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search by city, county, or zip code..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                />
            </div>

            {isOpen && (query.length >= 2 || results.length > 0) && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-2">
                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isDetecting || isLoading}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
                        >
                            <MapPin className="size-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                {isDetecting ? "Detecting..." : "Use my current location"}
                            </span>
                        </button>
                    </div>

                    {results.length > 0 && (
                        <>
                            <div className="border-t border-gray-200 dark:border-gray-700" />
                            <div className="max-h-60 overflow-y-auto p-2">
                                {results.map((region) => (
                                    <button
                                        key={region.id}
                                        type="button"
                                        onClick={() => handleSelect(region)}
                                        disabled={isLoading}
                                        className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
                                    >
                                        <span className="font-medium text-gray-900 dark:text-white">{region.name}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{region.full_name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {query.length >= 2 && results.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No regions found for "{query}"</div>
                    )}
                </div>
            )}
        </div>
    );
}

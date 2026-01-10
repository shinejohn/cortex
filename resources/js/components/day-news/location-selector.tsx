import { MapPin, Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/contexts/location-context";
import { cn } from "@/lib/utils";

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
        <div className={cn("relative", className)} ref={dropdownRef}>
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search by city, county, or zip code..."
                    className="w-full pl-10"
                />
            </div>

            {isOpen && (query.length >= 2 || results.length > 0) && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border bg-popover shadow-lg">
                    <div className="p-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleUseMyLocation}
                            disabled={isDetecting || isLoading}
                            className="w-full justify-start gap-2"
                        >
                            <MapPin className="size-5 text-primary" />
                            <span className="font-medium">{isDetecting ? "Detecting..." : "Use my current location"}</span>
                        </Button>
                    </div>

                    {results.length > 0 && (
                        <>
                            <div className="border-t" />
                            <div className="max-h-60 overflow-y-auto p-2">
                                {results.map((region) => (
                                    <Button
                                        key={region.id}
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleSelect(region)}
                                        disabled={isLoading}
                                        className="w-full flex-col items-start h-auto px-3 py-2"
                                    >
                                        <span className="font-medium">{region.name}</span>
                                        <span className="text-sm text-muted-foreground">{region.full_name}</span>
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}

                    {query.length >= 2 && results.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">No regions found for "{query}"</div>
                    )}
                </div>
            )}
        </div>
    );
}

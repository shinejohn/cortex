import { Globe, MapPin, Search, X } from "lucide-react";
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
    const { searchRegions, setRegion, detectFromBrowser, isLoading, currentRegion } = useLocation();
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
            {/* Current Community Display */}
            {currentRegion && !isOpen && (
                <div className="mb-3 rounded-lg border bg-card p-3">
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">Your Community</h4>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="size-4 text-primary" />
                            <span className="text-sm font-medium">{currentRegion.full_name ?? currentRegion.name}</span>
                        </div>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Current
                        </span>
                    </div>
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search communities..."
                    className="w-full pl-9 pr-8"
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <X className="size-4 text-muted-foreground" />
                    </button>
                )}
            </div>

            {isOpen && (query.length >= 2 || results.length > 0) && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border bg-popover shadow-lg">
                    <div className="p-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleUseMyLocation}
                            disabled={isDetecting || isLoading}
                            className="w-full justify-start gap-2"
                        >
                            <MapPin className="size-4 text-primary" />
                            <span className="font-medium">{isDetecting ? "Detecting..." : "Use my current location"}</span>
                        </Button>
                    </div>

                    {results.length > 0 && (
                        <>
                            <div className="border-t" />
                            <div className="p-2">
                                <h4 className="mb-1 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {query.length >= 2 ? "Search Results" : "Popular Communities"}
                                </h4>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-2">
                                {results.map((region) => (
                                    <Button
                                        key={region.id}
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleSelect(region)}
                                        disabled={isLoading}
                                        className="h-auto w-full flex-col items-start px-3 py-2"
                                    >
                                        <div className="flex w-full items-center gap-2">
                                            <MapPin className="size-4 text-muted-foreground" />
                                            <span className="font-medium">{region.name}</span>
                                        </div>
                                        <span className="ml-6 text-sm text-muted-foreground">{region.full_name}</span>
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}

                    {query.length >= 2 && results.length === 0 && (
                        <div className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">No communities found</p>
                            <p className="mt-1 text-xs text-muted-foreground/70">Try a different search term</p>
                        </div>
                    )}

                    <div className="border-t bg-muted/30 p-3">
                        <button
                            className="flex w-full items-center justify-center gap-1 text-sm text-primary hover:underline"
                            onClick={() => setIsOpen(false)}
                        >
                            <Globe className="size-4" />
                            <span>View National News</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
